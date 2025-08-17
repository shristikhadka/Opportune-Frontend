import { useState, useEffect } from 'react';
import { JobPost } from '../types';

const SAVED_JOBS_KEY = 'opportune_saved_jobs';

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved jobs:', error);
        setSavedJobs([]);
      }
    }
  }, []);

  const saveJob = (jobId: number) => {
    const updatedSavedJobs = [...savedJobs, jobId];
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedSavedJobs));
  };

  const unsaveJob = (jobId: number) => {
    const updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updatedSavedJobs));
  };

  const toggleSaveJob = (jobId: number) => {
    if (savedJobs.includes(jobId)) {
      unsaveJob(jobId);
    } else {
      saveJob(jobId);
    }
  };

  const isJobSaved = (jobId: number) => savedJobs.includes(jobId);

  const getSavedJobsFromList = (jobs: JobPost[]) => {
    return jobs.filter(job => savedJobs.includes(job.postId));
  };

  return {
    savedJobs,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    getSavedJobsFromList,
    savedJobsCount: savedJobs.length
  };
};