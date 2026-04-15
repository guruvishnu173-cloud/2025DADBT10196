import Common "common";

module {
  public type AdminMessage = {
    id : Nat;
    content : Text;
    imageRef : ?Text;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };
};
