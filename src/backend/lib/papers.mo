import List "mo:core/List";
import Storage "mo:caffeineai-object-storage/Storage";
import Types "../types/papers";
import Common "../types/common";

module {
  public func addPaper(
    papers : List.List<Types.QuestionPaper>,
    nextId : Nat,
    year : Text,
    subject : Text,
    midType : Text,
    storageRef : Storage.ExternalBlob,
    now : Common.Timestamp,
  ) : Types.QuestionPaper {
    let paper : Types.QuestionPaper = {
      id = nextId;
      year;
      subject;
      midType;
      uploadTimestamp = now;
      storageRef;
    };
    papers.add(paper);
    paper;
  };

  public func listPapers(
    papers : List.List<Types.QuestionPaper>,
    filter : Types.PaperFilter,
  ) : [Types.QuestionPaper] {
    papers.filter(func(p) {
      let yearMatch = switch (filter.year) {
        case (?y) p.year == y;
        case null true;
      };
      let subjectMatch = switch (filter.subject) {
        case (?s) p.subject == s;
        case null true;
      };
      let midTypeMatch = switch (filter.midType) {
        case (?m) p.midType == m;
        case null true;
      };
      yearMatch and subjectMatch and midTypeMatch;
    }).toArray();
  };

  public func deletePaper(
    papers : List.List<Types.QuestionPaper>,
    id : Common.PaperId,
  ) : Bool {
    let sizeBefore = papers.size();
    let retained = papers.filter(func(p) { p.id != id });
    papers.clear();
    papers.append(retained);
    papers.size() < sizeBefore;
  };

  public func getPaper(
    papers : List.List<Types.QuestionPaper>,
    id : Common.PaperId,
  ) : ?Types.QuestionPaper {
    papers.find(func(p) { p.id == id });
  };
};
