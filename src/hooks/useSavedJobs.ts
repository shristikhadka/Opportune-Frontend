import { useState, useEffect } from 'react';
import { JobPost } from '../types';

const getSavedJobsKey = (userId: number | undefined) => {
  return userId ? `opportune_saved_jobs_${userId}` : 'opportune_saved_jobs_guest';
};

export const useSavedJobs = (userId?: number) => {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  useEffect(() => {
    const savedJobsKey = getSavedJobsKey(userId);
    const saved = localStorage.getItem(savedJobsKey);
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved jobs:', error);
        setSavedJobs([]);
      }
    }
  }, [userId]);

  const saveJob = (jobId: number) => {
    const updatedSavedJobs = [...savedJobs, jobId];
    setSavedJobs(updatedSavedJobs);
    const savedJobsKey = getSavedJobsKey(userId);
    localStorage.setItem(savedJobsKey, JSON.stringify(updatedSavedJobs));
  };

  const unsaveJob = (jobId: number) => {
    const updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    setSavedJobs(updatedSavedJobs);
    const savedJobsKey = getSavedJobsKey(userId);
    localStorage.setItem(savedJobsKey, JSON.stringify(updatedSavedJobs));
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