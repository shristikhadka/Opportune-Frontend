import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resumeAnalyticsAPI } from '../services/api';

interface ParsedResume {
  id: number;
  applicationId: number;
  candidateName: string;
  email: string;
  phone?: string;
  skills: string[];
  yearsOfExperience?: number;
  experienceSummary?: string;
  educationSummary?: string;
  confidenceScore?: number;
  parsedAt: string;
}

const CandidateSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState<'skills' | 'experience'>('skills');
  const [skillQuery, setSkillQuery] = useState('');
  const [minExp, setMinExp] = useState<number>(0);
  const [maxExp, setMaxExp] = useState<number | undefined>();
  const [results, setResults] = useState<ParsedResume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await resumeAnalyticsAPI.getAIStatus();
      setAiStatus(response.data);
    } catch (err) {
      console.error('Error fetching AI status:', err);
    }
  };

  const handleSkillSearch = async () => {
    if (!skillQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await resumeAnalyticsAPI.searchBySkills(skillQuery.trim());
      setResults(response.data);
    } catch (err: any) {
      console.error('Error searching candidates:', err);
      setError('Failed to search candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resumeAnalyticsAPI.searchByExperience(minExp, maxExp);
      setResults(response.data);
    } catch (err: any) {
      console.error('Error searching candidates:', err);
      setError('Failed to search candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchType === 'skills') {
      handleSkillSearch();
    } else {
      handleExperienceSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (user?.role !== 'HR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available to HR users.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Go to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI-Powered Candidate Search
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Search through AI-parsed resumes to find the perfect candidates
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>

          {/* AI Status */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              Powered by {aiStatus?.service || 'AI Service'} •
              <span className={aiStatus?.aiEnabled ? 'text-green-600' : 'text-yellow-600'}>
                {aiStatus?.aiEnabled ? ' AI Enabled' : ' Basic Parsing'}
              </span>
            </span>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setSearchType('skills')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  searchType === 'skills'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Search by Skills
              </button>
              <button
                onClick={() => setSearchType('experience')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  searchType === 'experience'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Search by Experience
              </button>
            </div>
          </div>

          {searchType === 'skills' ? (
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Skills
                </label>
                <input
                  type="text"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. React, Python, Machine Learning..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !skillQuery.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  value={minExp}
                  onChange={(e) => setMinExp(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Experience (years, optional)
                </label>
                <input
                  type="number"
                  value={maxExp || ''}
                  onChange={(e) => setMaxExp(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Search Results ({results.length} candidate{results.length !== 1 ? 's' : ''})
            </h2>

            <div className="grid gap-6">
              {results.map((candidate) => (
                <div key={candidate.id} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {candidate.candidateName || 'Anonymous Candidate'}
                      </h3>
                      {candidate.email && (
                        <p className="text-sm text-blue-600 font-medium">{candidate.email}</p>
                      )}
                      {candidate.phone && (
                        <p className="text-sm text-gray-600">{candidate.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Link
                        to={`/applications/${candidate.applicationId}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
                      >
                        View Application
                      </Link>
                      <p className="text-xs text-gray-500 mt-2">
                        Parsed on {formatDate(candidate.parsedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {candidate.yearsOfExperience !== null && candidate.yearsOfExperience !== undefined && (
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-xs font-semibold text-purple-600 mb-1">Experience</p>
                        <p className="text-sm font-bold text-gray-900">{candidate.yearsOfExperience} years</p>
                      </div>
                    )}
                    {candidate.confidenceScore && (
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-xs font-semibold text-orange-600 mb-1">AI Confidence</p>
                        <p className="text-sm font-bold text-gray-900">{Math.round(candidate.confidenceScore * 100)}%</p>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-xs font-semibold text-green-600 mb-1">Skills Found</p>
                      <p className="text-sm font-bold text-gray-900">{candidate.skills?.length || 0}</p>
                    </div>
                  </div>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 8).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 rounded-md text-xs font-medium border border-indigo-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 8 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                            +{candidate.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {candidate.experienceSummary && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Experience Summary:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {candidate.experienceSummary.length > 200
                          ? candidate.experienceSummary.substring(0, 200) + '...'
                          : candidate.experienceSummary}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (skillQuery || minExp > 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any candidates matching your search criteria.
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or experience range.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link
            to="/hr-dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to HR Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateSearch;