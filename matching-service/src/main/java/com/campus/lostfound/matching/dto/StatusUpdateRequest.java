package com.campus.lostfound.matching.dto;

public class StatusUpdateRequest {

    private String status;
    private String note;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(String status) {
        this.status = status;
    }

    public StatusUpdateRequest(String status, String note) {
        this.status = status;
        this.note = note;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
