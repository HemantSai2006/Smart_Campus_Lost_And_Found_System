package com.campus.lostfound.item.dto;

import com.campus.lostfound.item.entity.ItemStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {
    @NotNull(message = "Status is required")
    private ItemStatus status;
    private String note;

    public StatusUpdateRequest() {}
    public StatusUpdateRequest(ItemStatus status) { this.status = status; }

    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}