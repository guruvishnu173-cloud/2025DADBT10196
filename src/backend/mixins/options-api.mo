import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OptionsLib "../lib/options";

mixin (
  accessControlState : AccessControl.AccessControlState,
  subjects : List.List<Text>,
  midTypes : List.List<Text>,
) {
  /// Admin only — add a subject to the dropdown list.
  public shared ({ caller }) func addSubject(subject : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add subjects");
    };
    OptionsLib.addSubject(subjects, subject);
  };

  /// Admin only — remove a subject from the dropdown list.
  public shared ({ caller }) func removeSubject(subject : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove subjects");
    };
    OptionsLib.removeSubject(subjects, subject);
  };

  /// Admin only — add a mid type to the dropdown list.
  public shared ({ caller }) func addMidType(midType : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add mid types");
    };
    OptionsLib.addMidType(midTypes, midType);
  };

  /// Admin only — remove a mid type from the dropdown list.
  public shared ({ caller }) func removeMidType(midType : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove mid types");
    };
    OptionsLib.removeMidType(midTypes, midType);
  };

  /// Public — list all available subjects.
  public query func listSubjects() : async [Text] {
    OptionsLib.listSubjects(subjects);
  };

  /// Public — list all available mid types.
  public query func listMidTypes() : async [Text] {
    OptionsLib.listMidTypes(midTypes);
  };
};
