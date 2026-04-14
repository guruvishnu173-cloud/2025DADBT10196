import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type QuestionPaper = {
    id : Common.PaperId;
    year : Text;
    subject : Text;
    midType : Text;
    uploadTimestamp : Common.Timestamp;
    storageRef : Storage.ExternalBlob;
  };

  public type PaperFilter = {
    year : ?Text;
    subject : ?Text;
    midType : ?Text;
  };
};
