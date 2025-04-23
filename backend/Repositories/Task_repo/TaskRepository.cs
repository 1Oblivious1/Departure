using backend.Models.Task_models;
using Npgsql;
using System.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repositories.Task_repo
{
    public class TaskRepository : ITaskRepository
    {
        private readonly string _connectionString;

        public TaskRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("PgSQL");
        }

        public async Task<TaskModel> CreateTaskAsync(TaskModel task)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    "INSERT INTO Task (title, description, difficulty, latitude, longitude) " +
                    "VALUES (@title, @description, @difficulty::taskdifficulty, @latitude, @longitude) " +
                    "RETURNING idTask", connection))
                {
                    command.Parameters.AddWithValue("@title", task.Title);
                    command.Parameters.AddWithValue("@description", task.Description);
                    command.Parameters.AddWithValue("@difficulty", task.Difficulty.ToString());
                    command.Parameters.AddWithValue("@latitude", task.Latitude);
                    command.Parameters.AddWithValue("@longitude", task.Longitude);

                    var id = (int)await command.ExecuteScalarAsync();
                    task.IdTask = id;
                    return task;
                }
            }
        }

        public async Task<List<TaskModel>> GetAllTasksAsync()
        {
            var tasks = new List<TaskModel>();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand("SELECT * FROM Task", connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            tasks.Add(new TaskModel
                            {
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask")),
                                Title = reader.GetString(reader.GetOrdinal("title")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(reader.GetOrdinal("difficulty"))),
                                Latitude = reader.GetDouble(reader.GetOrdinal("latitude")),
                                Longitude = reader.GetDouble(reader.GetOrdinal("longitude"))
                            });
                        }
                    }
                }
            }
            return tasks;
        }

        public async Task<TaskModel> GetTaskByIdAsync(int id)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand("SELECT * FROM Task WHERE idTask = @id", connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new TaskModel
                            {
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask")),
                                Title = reader.GetString(reader.GetOrdinal("title")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(reader.GetOrdinal("difficulty"))),
                                Latitude = reader.GetDouble(reader.GetOrdinal("latitude")),
                                Longitude = reader.GetDouble(reader.GetOrdinal("longitude"))
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task<List<TaskSubmission>> GetUserTaskSubmissionsAsync(int userId)
        {
            var submissions = new List<TaskSubmission>();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand("SELECT * FROM TaskSubmission WHERE idUser = @userId", connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            submissions.Add(new TaskSubmission
                            {
                                IdTaskSubmission = reader.GetInt32(reader.GetOrdinal("idTaskSubmission")),
                                Status = (TaskSubmissionStatus)Enum.Parse(typeof(TaskSubmissionStatus), reader.GetString(reader.GetOrdinal("status"))),
                                StartedAt = reader.GetDateTime(reader.GetOrdinal("started_at")),
                                EndedAt = reader.IsDBNull(reader.GetOrdinal("ended_at")) ? null : reader.GetDateTime(reader.GetOrdinal("ended_at")),
                                IdUser = reader.GetInt32(reader.GetOrdinal("idUser")),
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask"))
                            });
                        }
                    }
                }
            }
            return submissions;
        }

        public async Task<TaskSubmission> StartTaskAsync(int userId, int taskId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    "INSERT INTO TaskSubmission (status, started_at, idUser, idTask) " +
                    "VALUES (@status::tasksubmissionstatus, @startedAt, @userId, @taskId) " +
                    "RETURNING idTaskSubmission", connection))
                {
                    command.Parameters.AddWithValue("@status", TaskSubmissionStatus.Pending.ToString());
                    command.Parameters.AddWithValue("@startedAt", DateTime.Now);
                    command.Parameters.AddWithValue("@userId", userId);
                    command.Parameters.AddWithValue("@taskId", taskId);

                    var submissionId = (int)await command.ExecuteScalarAsync();

                    return new TaskSubmission
                    {
                        IdTaskSubmission = submissionId,
                        Status = TaskSubmissionStatus.Pending,
                        StartedAt = DateTime.Now,
                        IdUser = userId,
                        IdTask = taskId
                    };
                }
            }
        }

        public async Task<TaskSubmission> CompleteTaskAsync(int userId, int taskId, string photoUrl, string description)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        // Обновляем статус задания
                        using (var command = new NpgsqlCommand(
                            "UPDATE TaskSubmission SET status = @status::tasksubmissionstatus, ended_at = @endedAt, photo_url = @photoUrl " +
                            "WHERE idUser = @userId AND idTask = @taskId AND status = 'Pending'::tasksubmissionstatus " +
                            "RETURNING idTaskSubmission, status, started_at, ended_at, idUser, idTask, photo_url", 
                            connection, transaction))
                        {
                            command.Parameters.AddWithValue("@status", TaskSubmissionStatus.Completed.ToString());
                            command.Parameters.AddWithValue("@endedAt", DateTime.Now);
                            command.Parameters.AddWithValue("@photoUrl", photoUrl);
                            command.Parameters.AddWithValue("@userId", userId);
                            command.Parameters.AddWithValue("@taskId", taskId);

                            TaskSubmission submission = null;
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                if (await reader.ReadAsync())
                                {
                                    submission = new TaskSubmission
                                    {
                                        IdTaskSubmission = reader.GetInt32(0),
                                        Status = (TaskSubmissionStatus)Enum.Parse(typeof(TaskSubmissionStatus), reader.GetString(1)),
                                        StartedAt = reader.GetDateTime(2),
                                        EndedAt = reader.GetDateTime(3),
                                        IdUser = reader.GetInt32(4),
                                        IdTask = reader.GetInt32(5),
                                        PhotoUrl = reader.GetString(6)
                                    };
                                }
                            }

                            if (submission == null)
                            {
                                await transaction.RollbackAsync();
                                return null;
                            }

                            // Создаем запись в новостной ленте
                            using (var newsCommand = new NpgsqlCommand(
                                "INSERT INTO NewsFeed (description, idTaskSubmission) " +
                                "VALUES (@description, @idTaskSubmission) " +
                                "RETURNING idNewsFeed", connection, transaction))
                            {
                                newsCommand.Parameters.AddWithValue("@description", description);
                                newsCommand.Parameters.AddWithValue("@idTaskSubmission", submission.IdTaskSubmission);
                                await newsCommand.ExecuteScalarAsync();
                            }

                            await transaction.CommitAsync();
                            return submission;
                        }
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            }
        }

        public async Task<TaskSubmission> FailTaskAsync(int submissionId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    "UPDATE TaskSubmission SET status = @status, ended_at = @endedAt " +
                    "WHERE idTaskSubmission = @submissionId RETURNING *", connection))
                {
                    command.Parameters.AddWithValue("@status", TaskSubmissionStatus.Failed.ToString());
                    command.Parameters.AddWithValue("@endedAt", DateTime.Now);
                    command.Parameters.AddWithValue("@submissionId", submissionId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new TaskSubmission
                            {
                                IdTaskSubmission = reader.GetInt32(reader.GetOrdinal("idTaskSubmission")),
                                Status = TaskSubmissionStatus.Failed,
                                StartedAt = reader.GetDateTime(reader.GetOrdinal("started_at")),
                                EndedAt = reader.GetDateTime(reader.GetOrdinal("ended_at")),
                                IdUser = reader.GetInt32(reader.GetOrdinal("idUser")),
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask"))
                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task<List<(TaskModel Task, TaskSubmission Submission)>> GetUserTasksWithSubmissionsAsync(int userId)
        {
            var result = new List<(TaskModel Task, TaskSubmission Submission)>();
            
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    @"SELECT t.*, ts.* 
                      FROM Task t
                      JOIN TaskSubmission ts ON t.idTask = ts.idTask
                      WHERE ts.idUser = @userId
                      ORDER BY 
                          CASE WHEN ts.status = 'Pending'::tasksubmissionstatus THEN 0 ELSE 1 END,
                          CASE 
                              WHEN ts.status = 'Pending'::tasksubmissionstatus THEN ts.started_at 
                              ELSE ts.ended_at 
                          END DESC", connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var task = new TaskModel
                            {
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask")),
                                Title = reader.GetString(reader.GetOrdinal("title")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(reader.GetOrdinal("difficulty"))),
                                Latitude = reader.GetDouble(reader.GetOrdinal("latitude")),
                                Longitude = reader.GetDouble(reader.GetOrdinal("longitude"))
                            };

                            var submission = new TaskSubmission
                            {
                                IdTaskSubmission = reader.GetInt32(reader.GetOrdinal("idTaskSubmission")),
                                Status = (TaskSubmissionStatus)Enum.Parse(typeof(TaskSubmissionStatus), reader.GetString(reader.GetOrdinal("status"))),
                                StartedAt = reader.GetDateTime(reader.GetOrdinal("started_at")),
                                EndedAt = reader.IsDBNull(reader.GetOrdinal("ended_at")) ? null : reader.GetDateTime(reader.GetOrdinal("ended_at")),
                                IdUser = reader.GetInt32(reader.GetOrdinal("idUser")),
                                IdTask = reader.GetInt32(reader.GetOrdinal("idTask")),
                                PhotoUrl = reader.IsDBNull(reader.GetOrdinal("photo_url")) ? null : reader.GetString(reader.GetOrdinal("photo_url"))
                            };

                            result.Add((task, submission));
                        }
                    }
                }
            }
            return result;
        }

        public async Task<UserTaskIdsResponse> GetUserTaskIdsAsync(int userId)
        {
            var response = new UserTaskIdsResponse
            {
                ActiveTaskIds = new List<int>(),
                CompletedTaskIds = new List<int>()
            };

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    @"SELECT idTask, status 
                      FROM TaskSubmission 
                      WHERE idUser = @userId 
                      AND status IN ('Pending'::tasksubmissionstatus, 'Completed'::tasksubmissionstatus)", 
                    connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var taskId = reader.GetInt32(reader.GetOrdinal("idTask"));
                            var status = reader.GetString(reader.GetOrdinal("status"));

                            if (status == "Pending")
                            {
                                response.ActiveTaskIds.Add(taskId);
                            }
                            else if (status == "Completed")
                            {
                                response.CompletedTaskIds.Add(taskId);
                            }
                        }
                    }
                }
            }
            return response;
        }

        public async Task<List<NewsFeedPost>> GetNewsFeedAsync()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT 
                    nf.idNewsFeed,
                    nf.description,
                    ts.started_at,
                    nf.likes,
                    ts.idTaskSubmission,
                    ts.idUser,
                    ts.photo_url,
                    t.idTask,
                    t.title,
                    t.description as taskDescription,
                    t.difficulty,
                    t.latitude,
                    t.longitude,
                    upp.idUserProfilePublic,
                    upp.name
                FROM NewsFeed nf
                JOIN TaskSubmission ts ON nf.idTaskSubmission = ts.idTaskSubmission
                JOIN Task t ON ts.idTask = t.idTask
                JOIN ""User"" u ON ts.idUser = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                ORDER BY ts.started_at DESC";

            using var command = new NpgsqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            var posts = new List<NewsFeedPost>();
            while (await reader.ReadAsync())
            {
                posts.Add(new NewsFeedPost
                {
                    IdNewsFeed = reader.GetInt32(0),
                    Description = reader.GetString(1),
                    CreatedAt = reader.GetDateTime(2),
                    Likes = reader.GetInt32(3),
                    IdTaskSubmission = reader.GetInt32(4),
                    IdUser = reader.GetInt32(5),
                    PhotoUrl = reader.GetString(6),
                    IdTask = reader.GetInt32(7),
                    Title = reader.GetString(8),
                    TaskDescription = reader.GetString(9),
                    Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(10)),
                    Latitude = reader.GetDouble(11),
                    Longitude = reader.GetDouble(12),
                    IdUserProfilePublic = reader.GetInt32(13),
                    Name = reader.GetString(14),
                    Comments = new List<Comment>()
                });
            }

            // Загружаем комментарии для каждого поста в отдельном соединении
            foreach (var post in posts)
            {
                using var commentConnection = new NpgsqlConnection(_connectionString);
                await commentConnection.OpenAsync();
                post.Comments = await GetCommentsForPostAsync(commentConnection, post.IdNewsFeed);
            }

            return posts;
        }

        private async Task<List<Comment>> GetCommentsForPostAsync(NpgsqlConnection connection, int newsFeedId)
        {
            var query = @"
                SELECT 
                    c.idComments, 
                    c.text, 
                    upp.name, 
                    c.submitted_at
                FROM Comment c
                JOIN ""User"" u ON c.author = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE c.idNewsFeed = @newsFeedId
                ORDER BY c.submitted_at";

            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.AddWithValue("@newsFeedId", newsFeedId);

            using var reader = await command.ExecuteReaderAsync();
            var comments = new List<Comment>();

            while (await reader.ReadAsync())
            {
                comments.Add(new Comment
                {
                    IdComment = reader.GetInt32(0),
                    Text = reader.GetString(1),
                    AuthorName = reader.GetString(2),
                    SubmittedAt = reader.GetDateTime(3)
                });
            }

            return comments;
        }

        public async Task<NewsFeedPost> AddCommentAsync(int newsFeedId, int userId, string text)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                INSERT INTO Comment (text, author, idNewsFeed, submitted_at)
                VALUES (@text, @userId, @newsFeedId, @submittedAt)
                RETURNING idComments";

            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.AddWithValue("@text", text);
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@newsFeedId", newsFeedId);
            command.Parameters.AddWithValue("@submittedAt", DateTime.UtcNow);

            var commentId = (int)await command.ExecuteScalarAsync();

            // Получаем обновленный пост с новым комментарием в новом соединении
            using var postConnection = new NpgsqlConnection(_connectionString);
            await postConnection.OpenAsync();
            return await GetNewsFeedPostByIdAsync(postConnection, newsFeedId);
        }

        private async Task<NewsFeedPost> GetNewsFeedPostByIdAsync(NpgsqlConnection connection, int newsFeedId)
        {
            var query = @"
                SELECT 
                    nf.idNewsFeed,
                    nf.description,
                    ts.started_at,
                    nf.likes,
                    ts.idTaskSubmission,
                    ts.idUser,
                    ts.photo_url,
                    t.idTask,
                    t.title,
                    t.description as taskDescription,
                    t.difficulty,
                    t.latitude,
                    t.longitude,
                    upp.idUserProfilePublic,
                    upp.name
                FROM NewsFeed nf
                JOIN TaskSubmission ts ON nf.idTaskSubmission = ts.idTaskSubmission
                JOIN Task t ON ts.idTask = t.idTask
                JOIN ""User"" u ON ts.idUser = u.idUser
                JOIN UserProfilePublic upp ON u.idUserProfilePublic = upp.idUserProfilePublic
                WHERE nf.idNewsFeed = @newsFeedId";

            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.AddWithValue("@newsFeedId", newsFeedId);

            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }

            var post = new NewsFeedPost
            {
                IdNewsFeed = reader.GetInt32(0),
                Description = reader.GetString(1),
                CreatedAt = reader.GetDateTime(2),
                Likes = reader.GetInt32(3),
                IdTaskSubmission = reader.GetInt32(4),
                IdUser = reader.GetInt32(5),
                PhotoUrl = reader.GetString(6),
                IdTask = reader.GetInt32(7),
                Title = reader.GetString(8),
                TaskDescription = reader.GetString(9),
                Difficulty = (TaskDifficulty)Enum.Parse(typeof(TaskDifficulty), reader.GetString(10)),
                Latitude = reader.GetDouble(11),
                Longitude = reader.GetDouble(12),
                IdUserProfilePublic = reader.GetInt32(13),
                Name = reader.GetString(14),
                Comments = new List<Comment>()
            };

            // Загружаем комментарии в новом соединении
            using var commentConnection = new NpgsqlConnection(_connectionString);
            await commentConnection.OpenAsync();
            post.Comments = await GetCommentsForPostAsync(commentConnection, newsFeedId);

            return post;
        }

        public async Task<NewsFeedPost> LikePostAsync(int newsFeedId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                UPDATE NewsFeed 
                SET likes = likes + 1 
                WHERE idNewsFeed = @newsFeedId";

            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.AddWithValue("@newsFeedId", newsFeedId);
            await command.ExecuteNonQueryAsync();

            // Получаем обновленный пост
            return await GetNewsFeedPostByIdAsync(connection, newsFeedId);
        }
    }
} 