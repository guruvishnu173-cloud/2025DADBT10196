import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import ObjectStorage "mo:caffeineai-object-storage/Mixin";
import OptionsLib "lib/options";
import PaperTypes "types/papers";
import PapersApi "mixins/papers-api";
import OptionsApi "mixins/options-api";
import VisitsApi "mixins/visits-api";

actor {
  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Object storage infrastructure
  include ObjectStorage();

  // Question papers state
  let papers = List.empty<PaperTypes.QuestionPaper>();
  let nextPaperId = object { public var value : Nat = 0 };

  include PapersApi(accessControlState, papers, nextPaperId);

  // Dropdown options state — pre-populated with defaults
  let subjects = List.empty<Text>();
  let midTypes = List.empty<Text>();

  OptionsLib.addSubject(subjects, "CSE");
  OptionsLib.addSubject(subjects, "ECE");
  OptionsLib.addSubject(subjects, "MECH");
  OptionsLib.addSubject(subjects, "CIVIL");
  OptionsLib.addSubject(subjects, "IT");
  OptionsLib.addMidType(midTypes, "MID-1");
  OptionsLib.addMidType(midTypes, "MID-2");
  OptionsLib.addMidType(midTypes, "SUPPLE");

  include OptionsApi(accessControlState, subjects, midTypes);

  // Visit tracking state
  let visitCount = object { public var value : Nat = 0 };

  include VisitsApi(visitCount);
};
