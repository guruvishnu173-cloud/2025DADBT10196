import Runtime "mo:core/Runtime";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import PublicMessagesLib "../lib/public-messages";
import Types "../types/public-messages";

mixin (
  accessControlState : AccessControl.AccessControlState,
  publicMessages : List.List<Types.PublicMessage>,
  nextPublicMessageId : { var value : Nat },
) {
  /// Public — any visitor or admin can post a text message.
  public shared func addPublicMessage(content : Text, authorName : Text) : async Types.PublicMessage {
    PublicMessagesLib.add(publicMessages, nextPublicMessageId, content, authorName);
  };

  /// Public query — list all public messages, visible to everyone.
  public query func listPublicMessages() : async [Types.PublicMessage] {
    PublicMessagesLib.list(publicMessages);
  };

  /// Admin only — delete a public message by id (moderation).
  public shared ({ caller }) func deletePublicMessage(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete public messages");
    };
    PublicMessagesLib.remove(publicMessages, id);
  };
};
