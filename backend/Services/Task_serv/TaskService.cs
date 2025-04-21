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

        public async Task<TaskSubmission> CompleteTaskAsync(int submissionId)
        {
            return await _taskRepository.CompleteTaskAsync(submissionId);
        }

        public async Task<TaskSubmission> FailTaskAsync(int submissionId)
        {
            return await _taskRepository.FailTaskAsync(submissionId);
        }
    }
} 