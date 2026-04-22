import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import ObjectStorage "mo:caffeineai-object-storage/Mixin";
import OptionsLib "lib/options";
import PaperTypes "types/papers";
import PapersApi "mixins/papers-api";
import OptionsApi "mixins/options-api";
import NoteTypes "types/note";
import NoteApi "mixins/note-api";
import LikesApi "mixins/likes-api";
import AdminMessageTypes "types/admin-messages";
import AdminMessagesApi "mixins/admin-messages-api";
import PublicMessageTypes "types/public-messages";
import PublicMessagesApi "mixins/public-messages-api";



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

  OptionsLib.addSubject(subjects, "Calculus");
  OptionsLib.addSubject(subjects, "Differential Equations and Transformations");
  OptionsLib.addSubject(subjects, "Eng 1");
  OptionsLib.addSubject(subjects, "Eng 2");
  OptionsLib.addSubject(subjects, "Physics");
  OptionsLib.addSubject(subjects, "Chemistry");
  OptionsLib.addSubject(subjects, "BEEE");
  OptionsLib.addSubject(subjects, "Graphics");
  OptionsLib.addSubject(subjects, "DLSD");
  OptionsLib.addSubject(subjects, "Programming in C");
  OptionsLib.addSubject(subjects, "Python");
  OptionsLib.addMidType(midTypes, "MID-1");
  OptionsLib.addMidType(midTypes, "MID-2");
  OptionsLib.addMidType(midTypes, "SUPPLE");
  OptionsLib.addMidType(midTypes, "SEM");

  include OptionsApi(accessControlState, subjects, midTypes);

  // Site-wide note state
  let noteState = object { public var siteNote : ?NoteTypes.SiteNote = null };

  include NoteApi(accessControlState, noteState);

  // Like button state
  let likeState = object { public var count : Nat = 0 };

  include LikesApi(likeState);

  // Admin messages state
  let adminMessages = List.empty<AdminMessageTypes.AdminMessage>();
  let nextAdminMessageId = object { public var value : Nat = 0 };

  include AdminMessagesApi(accessControlState, adminMessages, nextAdminMessageId);

  // Public messages state
  let publicMessages = List.empty<PublicMessageTypes.PublicMessage>();
  let nextPublicMessageId = object { public var value : Nat = 0 };

  include PublicMessagesApi(accessControlState, publicMessages, nextPublicMessageId);
};
