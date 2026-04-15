import Common "common";

module {
  public type PublicMessage = {
    id : Nat;
    content : Text;
    authorName : Text;
    createdAt : Common.Timestamp;
  };
};
