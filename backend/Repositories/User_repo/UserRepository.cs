using Npgsql;
using Microsoft.Extensions.Configuration;
using backend.Models.User_models;

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
    }
}