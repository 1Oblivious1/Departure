using backend.Models.Task_models;

namespace backend.Repositories.Task_repo
{
    public interface ITaskRepository
    {
        Task<TaskModel> CreateTaskAsync(TaskModel task);
        Task<List<TaskModel>> GetAllTasksAsync();
        Task<TaskModel> GetTaskByIdAsync(int id);
        Task<List<TaskSubmission>> GetUserTaskSubmissionsAsync(int userId);
        Task<TaskSubmission> StartTaskAsync(int userId, int taskId);
        Task<TaskSubmission> CompleteTaskAsync(int userId, int taskId, string photoUrl);
        Task<TaskSubmission> FailTaskAsync(int submissionId);
        Task<List<(TaskModel Task, TaskSubmission Submission)>> GetUserTasksWithSubmissionsAsync(int userId);
        Task<UserTaskIdsResponse> GetUserTaskIdsAsync(int userId);
    }
} 