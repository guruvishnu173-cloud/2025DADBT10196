import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Storage "mo:caffeineai-object-storage/Storage";
import PapersLib "../lib/papers";
import Types "../types/papers";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  papers : List.List<Types.QuestionPaper>,
  nextPaperId : { var value : Nat },
) {
  /// Admin only — upload a question paper record with its object-storage reference.
  public shared ({ caller }) func uploadPaper(
    year : Text,
    subject : Text,
    midType : Text,
    storageRef : Storage.ExternalBlob,
  ) : async Common.PaperId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload papers");
    };
    let id = nextPaperId.value;
    nextPaperId.value += 1;
    let paper = PapersLib.addPaper(papers, id, year, subject, midType, storageRef, Time.now());
    paper.id;
  };

  /// Admin only — delete a question paper by id.
  public shared ({ caller }) func deletePaper(id : Common.PaperId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete papers");
    };
    PapersLib.deletePaper(papers, id);
  };

  /// Public — list question papers with optional filters.
  public query func listPapers(filter : Types.PaperFilter) : async [Types.QuestionPaper] {
    PapersLib.listPapers(papers, filter);
  };

  /// Public — get a single question paper by id.
  public query func getPaper(id : Common.PaperId) : async ?Types.QuestionPaper {
    PapersLib.getPaper(papers, id);
  };
};
