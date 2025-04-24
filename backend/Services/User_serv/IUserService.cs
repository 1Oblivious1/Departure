using backend.Models.User_models;
using backend.Models.Task_models;

namespace backend.Services.User_serv
{
    public interface IUserService
    {
        User RegisterUser(string name, string mail, string password, DateTime createdAt, string avatarUrl);
        User? LoginUser(string mail, string password);
        UserProfilePrivate? FindPrivateProfileByMail(string mail);
        void SubscribeUser(int subscriberId, int targetUserId);
        void UnsubscribeUser(int subscriberId, int targetUserId);
        (List<UserProfilePublic> Subscriptions, List<UserProfilePublic> Subscribers) GetUserSubscriptions(int userId);
        int CheckSubscriptionStatus(int subscriberId, int targetUserId);
        (int UserRank, List<UserProfilePublic> Rating) GetUsersRating(int userId);
        (UserProfilePublic Profile, int SubscribersCount, int SubscriptionsCount, int CompletedTasksCount, int TotalLikes, List<NewsFeedPost> Posts) GetUserProfile(int userId);
    }
}