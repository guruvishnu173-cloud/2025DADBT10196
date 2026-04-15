import Types "../types/likes";

module {
  public func increment(state : Types.LikeState) : Nat {
    state.count += 1;
    state.count;
  };

  public func getCount(state : Types.LikeState) : Nat {
    state.count;
  };
};
