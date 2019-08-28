enum UserType {
    EARNER = "earner",
    SPENDER = "spender"
}

enum PushType {
    JOB_OFFER = "Job offer",
    JOB_ACCEPTED = "Job is accepted",
    JOB_STARTED = "Job is started",
    JOB_REJECTED = "Job is rejected"
}

enum JobStatus {
    CREATED = "created",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    REJECTED = "rejected",
    IN_PROGRESS = "in progress",
    FINISHED = "finished",
    COMPLETED_UNPAID = "completed unpaid",
    COMPLETED_PAID = "completed paid"
}

enum ImageType {
    AVATAR = "avatar",
    CERTIFICATE = "certificate",
    BEFORE_JOB_STATUS = "beforeStatus",
    AFTER_JOB_STATUS = "afterStatus",
    ADDITIONAL = "additional"
}

enum MessageType {
    SEARCH_STARTED,
    SEARCH_IN_PROGRESS,
    REJECTED,
    REJECTED_CONFIRMED,
    ACCEPTED,
    ACCEPTED_CONFIRMED,
    SEARCH_FINISHED
}

export { UserType, ImageType, PushType, MessageType, JobStatus }
