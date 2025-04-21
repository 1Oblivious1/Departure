namespace backend.Models.Task_models
{
    public class UserTaskIdsResponse
    {
        public List<int> ActiveTaskIds { get; set; }    // ID активных заданий
        public List<int> CompletedTaskIds { get; set; } // ID выполненных заданий
    }
} 