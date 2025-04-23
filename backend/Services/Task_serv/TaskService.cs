using backend.Models.Task_models;
using backend.Repositories.Task_repo;

namespace backend.Services.Task_serv
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;

        public TaskService(ITaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<TaskModel> CreateTaskAsync(TaskModel task)
        {
            return await _taskRepository.CreateTaskAsync(task);
        }

        public async Task<List<TaskModel>> GetAllTasksAsync()
        {
            return await _taskRepository.GetAllTasksAsync();
        }

        public async Task<TaskModel> GetTaskByIdAsync(int id)
        {
            return await _taskRepository.GetTaskByIdAsync(id);
        }

        public async Task<List<TaskSubmission>> GetUserTaskSubmissionsAsync(int userId)
        {
            return await _taskRepository.GetUserTaskSubmissionsAsync(userId);
        }

        public async Task<TaskSubmission> StartTaskAsync(int userId, int taskId)
        {
            return await _taskRepository.StartTaskAsync(userId, taskId);
        }

        public async Task<TaskSubmission> CompleteTaskAsync(int userId, int taskId, string photoUrl, string description)
        {
            return await _taskRepository.CompleteTaskAsync(userId, taskId, photoUrl, description);
        }

        public async Task<TaskSubmission> FailTaskAsync(int submissionId)
        {
            return await _taskRepository.FailTaskAsync(submissionId);
        }

        public async Task<List<NewsFeedPost>> GetNewsFeedAsync()
        {
            return await _taskRepository.GetNewsFeedAsync();
        }

        public async Task<NewsFeedPost> AddCommentAsync(int newsFeedId, int userId, string text)
        {
            return await _taskRepository.AddCommentAsync(newsFeedId, userId, text);
        }

        public async Task<NewsFeedPost> LikePostAsync(int newsFeedId)
        {
            return await _taskRepository.LikePostAsync(newsFeedId);
        }

        public async Task<List<(TaskModel Task, TaskSubmission Submission)>> GetUserTasksWithSubmissionsAsync(int userId)
        {
            return await _taskRepository.GetUserTasksWithSubmissionsAsync(userId);
        }

        public async Task<UserTaskIdsResponse> GetUserTaskIdsAsync(int userId)
        {
            return await _taskRepository.GetUserTaskIdsAsync(userId);
        }

        public async Task<Achievement> CreateAchievementAsync(string name, int points)
        {
            return await _taskRepository.CreateAchievementAsync(name, points);
        }

        public async Task<List<Achievement>> GetUserAchievementsAsync(int userId)
        {
            return await _taskRepository.GetUserAchievementsAsync(userId);
        }
    }
} 