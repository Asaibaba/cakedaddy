package com.cakedaddy.model;

import java.time.LocalDateTime;

public class Rating {
    private String userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    
    public Rating() {}
    
    public Rating(String userId, String userName, Integer rating, String comment) {
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
