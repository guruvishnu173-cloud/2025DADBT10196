import Time "mo:core/Time";
import Types "../types/note";

module {
  public func setNote(state : { var siteNote : ?Types.SiteNote }, content : Text) {
    state.siteNote := ?{ content; updatedAt = Time.now() };
  };

  public func getNote(state : { var siteNote : ?Types.SiteNote }) : ?Types.SiteNote {
    state.siteNote;
  };

  public func clearNote(state : { var siteNote : ?Types.SiteNote }) {
    state.siteNote := null;
  };
};
