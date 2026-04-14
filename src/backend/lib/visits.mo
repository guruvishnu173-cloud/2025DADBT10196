module {
  public func increment(counter : { var value : Nat }) : Nat {
    counter.value += 1;
    counter.value;
  };
};
