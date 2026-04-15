import LikesLib "../lib/likes";
import Types "../types/likes";

mixin (likeState : Types.LikeState) {
  /// Public — any visitor can add a like; returns the updated count.
  public shared func addLike() : async Nat {
    LikesLib.increment(likeState);
  };

  /// Public query — returns the total like count.
  public query func getLikeCount() : async Nat {
    LikesLib.getCount(likeState);
  };
};
