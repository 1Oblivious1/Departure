using System;
using System.Collections.Generic;

namespace backend.Models.Task_models
{
    public class NewsFeedPost
    {
        public int IdNewsFeed { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Likes { get; set; }
        public int IdTaskSubmission { get; set; }
        public int IdUser { get; set; }
        public string PhotoUrl { get; set; }
        public int IdTask { get; set; }
        public string Title { get; set; }
        public string TaskDescription { get; set; }
        public TaskDifficulty Difficulty { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int IdUserProfilePublic { get; set; }
        public string Name { get; set; }
        public string AvatarUrl { get; set; }
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }

    public class Comment
    {
        public int IdComment { get; set; }
        public string Text { get; set; }
        public string AuthorName { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
} 