using backend.Models.User_models;

namespace backend.Repositories.User_repo
{
    public interface IUserRepository
    {
        void AddUser(User user);
        User? FindUserById(int id);
        UserProfilePublic? FindPublicProfileByName(string name);
        UserProfilePrivate? FindPrivateProfileByMail(string mail);
        void AddPublicProfile(UserProfilePublic profile);
        void AddPrivateProfile(UserProfilePrivate profile);
    }
}
