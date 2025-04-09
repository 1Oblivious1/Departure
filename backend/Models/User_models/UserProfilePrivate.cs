namespace backend.Models.User_models
{
    public class UserProfilePrivate
    {
        public int IdUserProfilePrivate { get; set; }
        public string Password { get; set; } = null!;
        public string Mail { get; set; } = null!;
    }
}
