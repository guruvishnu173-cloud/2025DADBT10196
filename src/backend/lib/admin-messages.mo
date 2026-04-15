import Time "mo:core/Time";
import List "mo:core/List";
import Types "../types/admin-messages";

module {
  public func add(
    messages : List.List<Types.AdminMessage>,
    nextId : { var value : Nat },
    content : Text,
    imageRef : ?Text,
  ) : Types.AdminMessage {
    let now = Time.now();
    let msg : Types.AdminMessage = {
      id = nextId.value;
      content;
      imageRef;
      createdAt = now;
      updatedAt = now;
    };
    nextId.value += 1;
    messages.add(msg);
    msg;
  };

  public func update(
    messages : List.List<Types.AdminMessage>,
    id : Nat,
    content : Text,
    imageRef : ?Text,
  ) : () {
    let now = Time.now();
    messages.mapInPlace(func(msg) {
      if (msg.id == id) { { msg with content; imageRef; updatedAt = now } }
      else { msg };
    });
  };

  public func remove(
    messages : List.List<Types.AdminMessage>,
    id : Nat,
  ) : () {
    let retained = messages.filter(func(msg) { msg.id != id });
    messages.clear();
    messages.append(retained);
  };

  public func list(messages : List.List<Types.AdminMessage>) : [Types.AdminMessage] {
    messages.toArray();
  };
};
