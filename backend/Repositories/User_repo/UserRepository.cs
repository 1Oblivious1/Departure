using Npgsql;
using Microsoft.Extensions.Configuration;
using backend.Models.User_models;
using backend.Models.Task_models;

namespace backend.Repositories.User_repo
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("PgSQL");
            // InitializeDatabase(); // Удаляем или оставляем пустым, так как таблицы уже созданы
        }

        private void InitializeDatabase()
        {
            // Пустой метод, так как таблицы уже существуют
        }

        public void AddPublicProfile(UserProfilePublic profile)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Реализация create_user_profile_public
            using var cmd = new NpgsqlCommand(
                "INSERT INTO UserProfilePublic (name, points, created_at, avatarUrl) " +
                "VALUES (@p_name, @p_points, @p_created_at, @p_avatarUrl) RETURNING idUserProfilePublic", conn);
            cmd.Parameters.AddWithValue("p_name", profile.Name);
            cmd.Parameters.AddWithValue("p_points", profile.Points);
            cmd.Parameters.AddWithValue("p_created_at", profile.CreatedAt);
            cmd.Parameters.AddWithValue("p_avatarUrl", profile.AvatarUrl);

            profile.IdUserProfilePublic = (int)cmd.ExecuteScalar();
        }

        public void AddPrivateProfile(UserProfilePrivate profile)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Реализация create_user_profile_private
            using var cmd = new NpgsqlCommand(
                "INSERT INTO UserProfilePrivate (password, mail) " +
                "VALUES (@p_password, @p_mail) RETURNING idUserProfilePrivate", conn);
            cmd.Parameters.AddWithValue("p_password", profile.Password);
            cmd.Parameters.AddWithValue("p_mail", profile.Mail);

            profile.IdUserProfilePrivate = (int)cmd.ExecuteScalar();
        }

        public void AddUser(User user)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Реализация create_user
            using var cmd = new NpgsqlCommand(
                "INSERT INTO \"User\" (idUserProfilePublic, idUserProfilePrivate) " +
                "VALUES (@p_idUserProfilePublic, @p_idUserProfilePrivate) RETURNING idUser", conn);
            cmd.Parameters.AddWithValue("p_idUserProfilePublic", user.IdUserProfilePublic.HasValue ? user.IdUserProfilePublic : (object)DBNull.Value);
            cmd.Parameters.AddWithValue("p_idUserProfilePrivate", user.IdUserProfilePrivate.HasValue ? user.IdUserProfilePrivate : (object)DBNull.Value);

            user.Id = (int)cmd.ExecuteScalar();
        }

        public User? FindUserById(int id)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Реализация get_user
            using var cmd = new NpgsqlCommand(
                "SELECT idUser, idUserProfilePublic, idUserProfilePrivate " +
                "FROM \"User\" WHERE idUser = @p_id", conn);
            cmd.Parameters.AddWithValue("p_id", id);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new User
                {
                    Id = reader.GetInt32(0),
                    IdUserProfilePublic = reader.IsDBNull(1) ? null : reader.GetInt32(1),
                    IdUserProfilePrivate = reader.IsDBNull(2) ? null : reader.GetInt32(2)
                };
            }
            return null;
        }

        public UserProfilePublic? FindPublicProfileByName(string name)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Оставляем как есть, так как это не было в SQL-функциях, но полезно
            using var cmd = new NpgsqlCommand(
                "SELECT idUserProfilePublic, name, points, created_at, avatarUrl " +
                "FROM UserProfilePublic WHERE name = @name", conn);
            cmd.Parameters.AddWithValue("name", name);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new UserProfilePublic
                {
                    IdUserProfilePublic = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Points = reader.GetInt32(2),
                    CreatedAt = reader.GetDateTime(3),
                    AvatarUrl = reader.GetString(4)
                };
            }
            return null;
        }

        public UserProfilePrivate? FindPrivateProfileByMail(string mail)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Оставляем как есть, так как это не было в SQL-функциях, но полезно
            using var cmd = new NpgsqlCommand(
                "SELECT idUserProfilePrivate, password, mail " +
                "FROM UserProfilePrivate WHERE mail = @mail", conn);
            cmd.Parameters.AddWithValue("mail", mail);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new UserProfilePrivate
                {
                    IdUserProfilePrivate = reader.GetInt32(0),
                    Password = reader.GetString(1),
                    Mail = reader.GetString(2)
                };
            }
            return null;
        }

        public void SubscribeUser(int subscriberId, int targetUserId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                WITH subscriber_profile AS (
                    SELECT idUserProfilePublic 
                    FROM ""User"" 
                    WHERE idUser = @subscriberId
                ),
                target_profile AS (
                    SELECT idUserProfilePublic 
                    FROM ""User"" 
                    WHERE idUser = @targetUserId
                )
                INSERT INTO UserSubscriptions (subscriber_id, target_user_id)
                SELECT @subscriberId, target_profile.idUserProfilePublic
                FROM target_profile
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM UserSubscriptions 
                    WHERE subscriber_id = @subscriberId 
                    AND target_user_id = target_profile.idUserProfilePublic
                )";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@subscriberId", subscriberId);
            cmd.Parameters.AddWithValue("@targetUserId", targetUserId);
            cmd.ExecuteNonQuery();
        }

        public void UnsubscribeUser(int subscriberId, int targetUserId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                DELETE FROM UserSubscriptions
                WHERE subscriber_id = @subscriberId
                AND target_user_id IN (
                    SELECT idUserProfilePublic 
                    FROM ""User"" 
                    WHERE idUser = @targetUserId
                )";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@subscriberId", subscriberId);
            cmd.Parameters.AddWithValue("@targetUserId", targetUserId);
            cmd.ExecuteNonQuery();
        }

        public (List<UserProfilePublic> Subscriptions, List<UserProfilePublic> Subscribers) GetUserSubscriptions(int userId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Запрос для получения подписок
            var subscriptionsQuery = @"
                SELECT upp.idUserProfilePublic, upp.name, upp.points, upp.created_at, upp.avatarUrl
                FROM UserSubscriptions us
                JOIN UserProfilePublic upp ON us.target_user_id = upp.idUserProfilePublic
                WHERE us.subscriber_id = @userId";

            // Запрос для получения подписчиков
            var subscribersQuery = @"
                SELECT upp.idUserProfilePublic, upp.name, upp.points, upp.created_at, upp.avatarUrl
                FROM UserSubscriptions us
                JOIN ""User"" u ON us.subscriber_id = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE us.target_user_id IN (
                    SELECT idUserProfilePublic 
                    FROM ""User"" 
                    WHERE idUser = @userId
                )";

            var subscriptions = new List<UserProfilePublic>();
            var subscribers = new List<UserProfilePublic>();

            // Получаем подписки
            using (var cmd = new NpgsqlCommand(subscriptionsQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    subscriptions.Add(new UserProfilePublic
                    {
                        IdUserProfilePublic = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Points = reader.GetInt32(2),
                        CreatedAt = reader.GetDateTime(3),
                        AvatarUrl = reader.GetString(4)
                    });
                }
            }

            // Получаем подписчиков
            using (var cmd = new NpgsqlCommand(subscribersQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    subscribers.Add(new UserProfilePublic
                    {
                        IdUserProfilePublic = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Points = reader.GetInt32(2),
                        CreatedAt = reader.GetDateTime(3),
                        AvatarUrl = reader.GetString(4)
                    });
                }
            }

            return (subscriptions, subscribers);
        }

        public int CheckSubscriptionStatus(int subscriberId, int targetUserId)
        {
            // Если это один и тот же пользователь
            if (subscriberId == targetUserId)
            {
                return 0; // Ваш профиль
            }

            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                SELECT 1 
                FROM UserSubscriptions 
                WHERE subscriber_id = @subscriberId 
                AND target_user_id IN (
                    SELECT idUserProfilePublic 
                    FROM ""User"" 
                    WHERE idUser = @targetUserId
                )";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@subscriberId", subscriberId);
            cmd.Parameters.AddWithValue("@targetUserId", targetUserId);

            var result = cmd.ExecuteScalar();
            
            // Если есть запись о подписке
            if (result != null)
            {
                return 1; // Отписаться
            }
            
            return 2; // Подписаться
        }

        public (int UserRank, List<UserProfilePublic> Rating) GetUsersRating(int userId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Получаем место пользователя в рейтинге
            var rankQuery = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY upp.points DESC) as rank
                FROM UserProfilePublic upp
                JOIN ""User"" u ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE u.idUser = @userId";

            int userRank = 0;
            using (var rankCmd = new NpgsqlCommand(rankQuery, conn))
            {
                rankCmd.Parameters.AddWithValue("@userId", userId);
                var result = rankCmd.ExecuteScalar();
                if (result != null)
                {
                    userRank = Convert.ToInt32(result);
                }
            }

            // Получаем полный рейтинг
            var ratingQuery = @"
                SELECT 
                    upp.idUserProfilePublic,
                    upp.name,
                    upp.points,
                    upp.avatarUrl
                FROM UserProfilePublic upp
                ORDER BY upp.points DESC";

            var users = new List<UserProfilePublic>();

            using var ratingCmd = new NpgsqlCommand(ratingQuery, conn);
            using var reader = ratingCmd.ExecuteReader();
            
            while (reader.Read())
            {
                users.Add(new UserProfilePublic
                {
                    IdUserProfilePublic = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Points = reader.GetInt32(2),
                    AvatarUrl = reader.GetString(3)
                });
            }

            return (userRank, users);
        }

        public (UserProfilePublic Profile, int SubscribersCount, int SubscriptionsCount, int CompletedTasksCount, int TotalLikes, List<NewsFeedPost> Posts) GetUserProfile(int userId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            // Получаем основную информацию о профиле
            var profileQuery = @"
                SELECT 
                    upp.idUserProfilePublic,
                    upp.name,
                    upp.points,
                    upp.avatarUrl,
                    upp.created_at
                FROM UserProfilePublic upp
                JOIN ""User"" u ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE u.idUser = @userId";

            UserProfilePublic? profile = null;
            using (var cmd = new NpgsqlCommand(profileQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    profile = new UserProfilePublic
                    {
                        IdUserProfilePublic = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Points = reader.GetInt32(2),
                        AvatarUrl = reader.GetString(3),
                        CreatedAt = reader.GetDateTime(4)
                    };
                }
            }

            if (profile == null)
            {
                throw new Exception("Пользователь не найден");
            }

            // Получаем количество подписчиков и подписок
            var subscriptionsQuery = @"
                SELECT 
                    (SELECT COUNT(*) FROM UserSubscriptions WHERE target_user_id = upp.idUserProfilePublic) as subscribers_count,
                    (SELECT COUNT(*) FROM UserSubscriptions WHERE subscriber_id = u.idUser) as subscriptions_count
                FROM UserProfilePublic upp
                JOIN ""User"" u ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE u.idUser = @userId";

            int subscribersCount = 0;
            int subscriptionsCount = 0;
            using (var cmd = new NpgsqlCommand(subscriptionsQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    subscribersCount = reader.GetInt32(0);
                    subscriptionsCount = reader.GetInt32(1);
                }
            }

            // Получаем количество завершенных заданий
            var completedTasksQuery = @"
                SELECT COUNT(*) 
                FROM TaskSubmission ts
                WHERE ts.idUser = @userId 
                AND ts.status = 'Completed'::tasksubmissionstatus";

            int completedTasksCount = 0;
            using (var cmd = new NpgsqlCommand(completedTasksQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                completedTasksCount = Convert.ToInt32(cmd.ExecuteScalar());
            }

            // Получаем общее количество лайков
            var likesQuery = @"
                SELECT COALESCE(SUM(nf.likes), 0)
                FROM NewsFeed nf
                JOIN TaskSubmission ts ON nf.idTaskSubmission = ts.idTaskSubmission
                WHERE ts.idUser = @userId";

            int totalLikes = 0;
            using (var cmd = new NpgsqlCommand(likesQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                totalLikes = Convert.ToInt32(cmd.ExecuteScalar());
            }

            // Получаем посты пользователя
            var postsQuery = @"
                SELECT 
                    nf.idNewsFeed,
                    nf.description,
                    ts.started_at,
                    nf.likes,
                    ts.idTaskSubmission,
                    ts.photo_url,
                    t.idTask,
                    t.title,
                    t.description as taskDescription,
                    t.difficulty,
                    t.latitude,
                    t.longitude,
                    upp.idUserProfilePublic,
                    upp.name,
                    upp.avatarUrl
                FROM NewsFeed nf
                JOIN TaskSubmission ts ON nf.idTaskSubmission = ts.idTaskSubmission
                JOIN Task t ON ts.idTask = t.idTask
                JOIN ""User"" u ON ts.idUser = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE ts.idUser = @userId
                ORDER BY ts.started_at DESC";

            var posts = new List<NewsFeedPost>();
            using (var cmd = new NpgsqlCommand(postsQuery, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    var post = new NewsFeedPost
                    {
                        IdNewsFeed = reader.GetInt32(0),
                        Description = reader.GetString(1),
                        CreatedAt = reader.GetDateTime(2),
                        Likes = reader.GetInt32(3),
                        IdTaskSubmission = reader.GetInt32(4),
                        PhotoUrl = reader.GetString(5),
                        IdTask = reader.GetInt32(6),
                        Title = reader.GetString(7),
                        TaskDescription = reader.GetString(8),
                        Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(9)),
                        Latitude = reader.GetDouble(10),
                        Longitude = reader.GetDouble(11),
                        IdUserProfilePublic = reader.GetInt32(12),
                        Name = reader.GetString(13),
                        AvatarUrl = reader.GetString(14),
                        Comments = new List<Comment>()
                    };

                    // Загружаем комментарии для поста
                    var commentsQuery = @"
                        SELECT 
                            c.idComments,
                            c.text,
                            c.submitted_at,
                            upp.idUserProfilePublic,
                            upp.name,
                            upp.avatarUrl
                        FROM Comment c
                        JOIN ""User"" u ON c.author = u.idUser
                        JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                        WHERE c.idNewsFeed = @newsFeedId
                        ORDER BY c.submitted_at DESC";

                    using (var commentsConn = new NpgsqlConnection(_connectionString))
                    {
                        commentsConn.Open();
                        using (var commentsCmd = new NpgsqlCommand(commentsQuery, commentsConn))
                        {
                            commentsCmd.Parameters.AddWithValue("@newsFeedId", post.IdNewsFeed);
                            using var commentsReader = commentsCmd.ExecuteReader();
                            while (commentsReader.Read())
                            {
                                post.Comments.Add(new Comment
                                {
                                    IdComment = commentsReader.GetInt32(0),
                                    Text = commentsReader.GetString(1),
                                    SubmittedAt = commentsReader.GetDateTime(2),
                                    IdUserProfilePublic = commentsReader.GetInt32(3),
                                    AuthorName = commentsReader.GetString(4),
                                    AvatarUrl = commentsReader.GetString(5)
                                });
                            }
                        }
                    }

                    posts.Add(post);
                }
            }

            return (profile, subscribersCount, subscriptionsCount, completedTasksCount, totalLikes, posts);
        }

        public List<NewsFeedPost> GetFavoritePosts(int userId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                SELECT 
                    nf.idNewsFeed,
                    nf.description,
                    ts.started_at,
                    nf.likes,
                    ts.idTaskSubmission,
                    ts.photo_url,
                    t.idTask,
                    t.title,
                    t.description as taskDescription,
                    t.difficulty,
                    t.latitude,
                    t.longitude,
                    upp.idUserProfilePublic,
                    upp.name,
                    upp.avatarUrl
                FROM FavoritePosts fp
                JOIN NewsFeed nf ON fp.post_id = nf.idNewsFeed
                JOIN TaskSubmission ts ON nf.idTaskSubmission = ts.idTaskSubmission
                JOIN Task t ON ts.idTask = t.idTask
                JOIN ""User"" u ON ts.idUser = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE fp.user_id = @userId
                ORDER BY fp.saved_at DESC";

            var posts = new List<NewsFeedPost>();
            using (var cmd = new NpgsqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@userId", userId);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    var post = new NewsFeedPost
                    {
                        IdNewsFeed = reader.GetInt32(0),
                        Description = reader.GetString(1),
                        CreatedAt = reader.GetDateTime(2),
                        Likes = reader.GetInt32(3),
                        IdTaskSubmission = reader.GetInt32(4),
                        PhotoUrl = reader.GetString(5),
                        IdTask = reader.GetInt32(6),
                        Title = reader.GetString(7),
                        TaskDescription = reader.GetString(8),
                        Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(9)),
                        Latitude = reader.GetDouble(10),
                        Longitude = reader.GetDouble(11),
                        IdUserProfilePublic = reader.GetInt32(12),
                        Name = reader.GetString(13),
                        AvatarUrl = reader.GetString(14),
                        Comments = new List<Comment>()
                    };

                    // Загружаем комментарии для поста
                    var commentsQuery = @"
                        SELECT 
                            c.idComments,
                            c.text,
                            c.submitted_at,
                            upp.idUserProfilePublic,
                            upp.name,
                            upp.avatarUrl
                        FROM Comment c
                        JOIN ""User"" u ON c.author = u.idUser
                        JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                        WHERE c.idNewsFeed = @newsFeedId
                        ORDER BY c.submitted_at DESC";

                    using (var commentsConn = new NpgsqlConnection(_connectionString))
                    {
                        commentsConn.Open();
                        using (var commentsCmd = new NpgsqlCommand(commentsQuery, commentsConn))
                        {
                            commentsCmd.Parameters.AddWithValue("@newsFeedId", post.IdNewsFeed);
                            using var commentsReader = commentsCmd.ExecuteReader();
                            while (commentsReader.Read())
                            {
                                post.Comments.Add(new Comment
                                {
                                    IdComment = commentsReader.GetInt32(0),
                                    Text = commentsReader.GetString(1),
                                    SubmittedAt = commentsReader.GetDateTime(2),
                                    IdUserProfilePublic = commentsReader.GetInt32(3),
                                    AuthorName = commentsReader.GetString(4),
                                    AvatarUrl = commentsReader.GetString(5)
                                });
                            }
                        }
                    }

                    posts.Add(post);
                }
            }

            return posts;
        }

        public void AddToFavorites(int userId, int postId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                INSERT INTO FavoritePosts (user_id, post_id)
                VALUES (@userId, @postId)
                ON CONFLICT (user_id, post_id) DO NOTHING";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@postId", postId);
            cmd.ExecuteNonQuery();
        }

        public void RemoveFromFavorites(int userId, int postId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                DELETE FROM FavoritePosts
                WHERE user_id = @userId AND post_id = @postId";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@postId", postId);
            cmd.ExecuteNonQuery();
        }

        public int CheckFavoriteStatus(int userId, int postId)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            conn.Open();

            var query = @"
                SELECT 1 
                FROM FavoritePosts
                WHERE user_id = @userId AND post_id = @postId";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@postId", postId);

            var result = cmd.ExecuteScalar();
            return result != null ? 1 : 0;
        }
    }
}