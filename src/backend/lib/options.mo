import List "mo:core/List";

module {
  public func addItem(items : List.List<Text>, item : Text) {
    // No duplicates
    let exists = items.find(func(t) { t == item });
    switch (exists) {
      case (?_) {}; // already present, skip
      case null { items.add(item) };
    };
  };

  public func removeItem(items : List.List<Text>, item : Text) {
    let filtered = items.filter(func(t) { t != item });
    items.clear();
    items.append(filtered);
  };

  public func listItems(items : List.List<Text>) : [Text] {
    items.toArray();
  };

  // Convenience wrappers kept for call-site clarity
  public func addSubject(subjects : List.List<Text>, subject : Text) {
    addItem(subjects, subject);
  };

  public func addMidType(midTypes : List.List<Text>, midType : Text) {
    addItem(midTypes, midType);
  };

  public func removeSubject(subjects : List.List<Text>, subject : Text) {
    removeItem(subjects, subject);
  };

  public func removeMidType(midTypes : List.List<Text>, midType : Text) {
    removeItem(midTypes, midType);
  };

  public func listSubjects(subjects : List.List<Text>) : [Text] {
    listItems(subjects);
  };

  public func listMidTypes(midTypes : List.List<Text>) : [Text] {
    listItems(midTypes);
  };
};
