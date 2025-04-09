namespace backend.Models.User_models
{
    public class UserProfilePublic
    {
        public int IdUserProfilePublic { get; set; }
        public string Name { get; set; } = null!;
        public int Points { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
    }
}
