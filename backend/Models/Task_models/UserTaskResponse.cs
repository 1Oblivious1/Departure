namespace backend.Models.Task_models
{
    public class UserTaskResponse
    {
        public int TaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public TaskDifficulty Difficulty { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        public int SubmissionId { get; set; }
        public TaskSubmissionStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public string PhotoUrl { get; set; }
    }
} 