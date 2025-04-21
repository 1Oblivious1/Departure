using backend.Models.Task_models;
using Npgsql;
using System.Data;

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
                    "VALUES (@status, @startedAt, @userId, @taskId) RETURNING idTaskSubmission", connection))
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

        public async Task<TaskSubmission> CompleteTaskAsync(int submissionId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var command = new NpgsqlCommand(
                    "UPDATE TaskSubmission SET status = @status, ended_at = @endedAt " +
                    "WHERE idTaskSubmission = @submissionId RETURNING *", connection))
                {
                    command.Parameters.AddWithValue("@status", TaskSubmissionStatus.Completed.ToString());
                    command.Parameters.AddWithValue("@endedAt", DateTime.Now);
                    command.Parameters.AddWithValue("@submissionId", submissionId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new TaskSubmission
                            {
                                IdTaskSubmission = reader.GetInt32(reader.GetOrdinal("idTaskSubmission")),
                                Status = TaskSubmissionStatus.Completed,
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
    }
} 