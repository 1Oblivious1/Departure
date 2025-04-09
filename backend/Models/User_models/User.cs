using System.ComponentModel.DataAnnotations;

namespace backend.Models.User_models
{
    public class User
    {
        public int Id { get; set; }
        public int? IdUserProfilePublic { get; set; }
        public int? IdUserProfilePrivate { get; set; }
    }
}