package com.campus.lostfound.item.dto;

public class AdminItemResponse extends ItemResponse {
    private String privateDetails;

    public AdminItemResponse() {}

    public String getPrivateDetails() { return privateDetails; }
    public void setPrivateDetails(String privateDetails) { this.privateDetails = privateDetails; }
}
