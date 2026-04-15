import Time "mo:core/Time";
import List "mo:core/List";
import Types "../types/public-messages";

module {
  public func add(
    messages : List.List<Types.PublicMessage>,
    nextId : { var value : Nat },
    content : Text,
    authorName : Text,
  ) : Types.PublicMessage {
    let msg : Types.PublicMessage = {
      id = nextId.value;
      content;
      authorName;
      createdAt = Time.now();
    };
    nextId.value += 1;
    messages.add(msg);
    msg;
  };

  public func remove(
    messages : List.List<Types.PublicMessage>,
    id : Nat,
  ) : () {
    let retained = messages.filter(func(msg) { msg.id != id });
    messages.clear();
    messages.append(retained);
  };

  public func list(messages : List.List<Types.PublicMessage>) : [Types.PublicMessage] {
    messages.toArray();
  };
};
