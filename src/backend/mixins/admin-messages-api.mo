import Runtime "mo:core/Runtime";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import AdminMessagesLib "../lib/admin-messages";
import Types "../types/admin-messages";

mixin (
  accessControlState : AccessControl.AccessControlState,
  adminMessages : List.List<Types.AdminMessage>,
  nextAdminMessageId : { var value : Nat },
) {
  /// Admin only — create a new admin message with optional image/GIF ref.
  public shared ({ caller }) func addAdminMessage(content : Text, imageRef : ?Text) : async Types.AdminMessage {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add admin messages");
    };
    AdminMessagesLib.add(adminMessages, nextAdminMessageId, content, imageRef);
  };

  /// Admin only — update content or imageRef of an existing admin message.
  public shared ({ caller }) func updateAdminMessage(id : Nat, content : Text, imageRef : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update admin messages");
    };
    AdminMessagesLib.update(adminMessages, id, content, imageRef);
  };

  /// Admin only — delete an admin message by id.
  public shared ({ caller }) func deleteAdminMessage(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete admin messages");
    };
    AdminMessagesLib.remove(adminMessages, id);
  };

  /// Public query — list all admin messages.
  public query func listAdminMessages() : async [Types.AdminMessage] {
    AdminMessagesLib.list(adminMessages);
  };
};
