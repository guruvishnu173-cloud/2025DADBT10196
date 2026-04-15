// Migration: drops the visitCount stable field removed in this version.
module {
  type OldActor = { visitCount : { var value : Nat } };
  type NewActor = {};

  public func run(_old : OldActor) : NewActor { {} };
};
