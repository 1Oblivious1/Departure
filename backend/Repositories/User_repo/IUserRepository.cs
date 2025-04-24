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
        void SubscribeUser(int subscriberId, int targetUserId);
        void UnsubscribeUser(int subscriberId, int targetUserId);
        (List<UserProfilePublic> Subscriptions, List<UserProfilePublic> Subscribers) GetUserSubscriptions(int userId);
        int CheckSubscriptionStatus(int subscriberId, int targetUserId);
    }
}
