import VisitsLib "../lib/visits";

mixin (visitCount : { var value : Nat }) {
  /// Public — increment visitor count and return updated total.
  public shared func trackVisit() : async Nat {
    VisitsLib.increment(visitCount);
  };

  /// Public — query total visitor count.
  public query func getVisitorCount() : async Nat {
    visitCount.value;
  };
};
