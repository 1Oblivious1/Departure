namespace backend.Models.Task_models
{
    public class Comment
    {
        public int IdComment { get; set; }
        public string Text { get; set; } = null!;
        public string AuthorName { get; set; } = null!;
        public int IdUserProfilePublic { get; set; }
        public string AvatarUrl { get; set; } = null!;
        public DateTime SubmittedAt { get; set; }
    }
} 