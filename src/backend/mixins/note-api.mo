import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import NoteLib "../lib/note";
import Types "../types/note";

mixin (
  accessControlState : AccessControl.AccessControlState,
  noteState : { var siteNote : ?Types.SiteNote },
) {
  /// Admin only — set or replace the site-wide note.
  public shared ({ caller }) func setNote(content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set the site note");
    };
    NoteLib.setNote(noteState, content);
  };

  /// Admin only — delete the site-wide note.
  public shared ({ caller }) func clearNote() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can clear the site note");
    };
    NoteLib.clearNote(noteState);
  };

  /// Public — get the current site-wide note (null if none set).
  public query func getNote() : async ?Types.SiteNote {
    NoteLib.getNote(noteState);
  };
};
