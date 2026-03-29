import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import {
  createDisasterUpdate,
  geocodeDisasterLocation,
  getDisasterAlerts,
  getDisasterUpdates
} from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { value: 'alert', label: 'Alert', tone: 'bg-rose-100 text-rose-900' },
  { value: 'shelter', label: 'Shelter', tone: 'bg-indigo-100 text-indigo-900' },
  { value: 'supplies', label: 'Supplies', tone: 'bg-amber-100 text-amber-900' },
  { value: 'volunteer', label: 'Volunteer', tone: 'bg-emerald-100 text-emerald-900' },
  { value: 'request', label: 'Request', tone: 'bg-slate-100 text-slate-900' }
];

const formatAlertTime = (value?: number) => {
  if (!value) return '';
  return new Date(value * 1000).toLocaleString();
};

const formatResultLabel = (result: any) => {
  const parts = [result.name, result.state, result.country].filter(Boolean);
  return parts.join(', ');
};

export const DisasterRecoveryPage = () => {
  const { user } = useAuth();
  const [scope, setScope] = useState<'county' | 'country' | 'global'>('county');
  const [updates, setUpdates] = useState<any[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updatesError, setUpdatesError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'alert',
    location_name: '',
    contact_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState('');
  const [alertsLocation, setAlertsLocation] = useState('');
  const [alertsUpdatedAt, setAlertsUpdatedAt] = useState<Date | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const scopeValue = useMemo(() => {
    if (scope === 'country') return user?.country || 'United States';
    if (scope === 'global') return '';
    return user?.neighborhood_tag || '';
  }, [scope, user?.country, user?.neighborhood_tag]);

  const fetchUpdates = async () => {
    setUpdatesLoading(true);
    setUpdatesError('');
    try {
      const data = await getDisasterUpdates(scope, scopeValue || undefined);
      setUpdates(data || []);
    } catch (error) {
      console.error('Failed to load disaster updates', error);
      setUpdatesError('Failed to load community updates');
    } finally {
      setUpdatesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUpdates();
  }, [scope, scopeValue, user]);

  const loadAlertsForCoords = async (lat: number, lon: number, label: string) => {
    setAlertsLoading(true);
    setAlertsError('');
    try {
      const data = await getDisasterAlerts(lat, lon);
      setAlerts(data?.alerts || []);
      setCurrentWeather(data?.current || null);
      setAlertsLocation(label);
      setAlertsUpdatedAt(new Date());
    } catch (error) {
      console.error('Failed to fetch alerts', error);
      setAlertsError('Unable to load alerts right now.');
    } finally {
      setAlertsLoading(false);
      setGeoLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        loadAlertsForCoords(latitude, longitude, 'Your location');
      },
      () => {
        setGeoLoading(false);
        setAlertsError('Location access denied.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchLoading(true);
    try {
      const results = await geocodeDisasterLocation(query);
      setSearchResults(results || []);
      if (!results || results.length === 0) {
        toast('No locations found for that search.', { icon: '🔎' });
      }
    } catch (error) {
      console.error('Failed to geocode location', error);
      toast.error('Location search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectLocation = (result: any) => {
    if (!result) return;
    setSearchResults([]);
    setSearchQuery(formatResultLabel(result));
    loadAlertsForCoords(result.lat, result.lon, formatResultLabel(result));
  };

  const handleCreateUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Add a title and description');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createDisasterUpdate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location_name: formData.location_name.trim(),
        contact_info: formData.contact_info.trim(),
        scope,
        scope_value: scopeValue || undefined
      });
      setUpdates((prev) => [created, ...prev]);
      toast.success('Update shared with your community');
      setFormData({
        title: '',
        description: '',
        category: 'alert',
        location_name: '',
        contact_info: ''
      });
    } catch (error) {
      console.error('Failed to create update', error);
      toast.error('Failed to share update');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-400/20 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-32 w-32 bg-rose-400/20 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">Disaster Recovery</p>
          <h1 className="text-4xl md:text-5xl font-black mt-3">Respond fast. Recover together.</h1>
          <p className="mt-4 max-w-2xl text-emerald-100 text-sm md:text-base">
            Track live alerts, coordinate shelters, and share recovery resources for your community.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className="px-5 py-2.5 rounded-full bg-emerald-400 text-emerald-950 font-bold hover:bg-emerald-300 disabled:opacity-60"
            >
              {geoLoading ? 'Locating...' : 'Use my location'}
            </button>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <span className="material-symbols-outlined text-emerald-200">search</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search city or zip"
                className="bg-transparent text-sm text-white placeholder:text-emerald-200 outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="text-xs font-bold uppercase tracking-wide text-emerald-200"
              >
                {searchLoading ? 'Searching...' : 'Go'}
              </button>
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-3 space-y-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.lat}-${result.lon}-${result.name}`}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/20 text-sm"
                >
                  {formatResultLabel(result)}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-surface-container-low bg-surface-container-lowest p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">OpenWeather Alerts</p>
                <h2 className="text-2xl font-bold text-on-surface mt-2">Live emergency feed</h2>
              </div>
              {alertsLocation && (
                <div className="text-xs font-semibold text-on-surface-variant text-right">
                  <p>{alertsLocation}</p>
                  {alertsUpdatedAt && <p>Updated {alertsUpdatedAt.toLocaleTimeString()}</p>}
                </div>
              )}
            </div>

            {alertsLoading ? (
              <p className="mt-6 text-sm text-on-surface-variant">Loading alerts...</p>
            ) : alertsError ? (
              <p className="mt-6 text-sm text-error">{alertsError}</p>
            ) : (
              <div className="mt-6 space-y-4">
                {currentWeather && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">Current Conditions</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-emerald-900">
                      <span>{currentWeather.description || 'Clear skies'}</span>
                      {typeof currentWeather.temperature === 'number' && <span>{Math.round(currentWeather.temperature)}°</span>}
                      {typeof currentWeather.wind_speed === 'number' && <span>Wind {Math.round(currentWeather.wind_speed)} m/s</span>}
                      {typeof currentWeather.humidity === 'number' && <span>Humidity {currentWeather.humidity}%</span>}
                    </div>
                  </div>
                )}

                {alerts.length === 0 ? (
                  <div className="rounded-2xl border border-surface-container-low p-5 text-sm text-on-surface-variant">
                    {alertsLocation
                      ? 'No active alerts for this area. Stay prepared and check back regularly.'
                      : 'Select a location to load OpenWeather alerts.'}
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <article key={`${alert.event}-${alert.start}`} className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">{alert.sender_name || 'OpenWeather Alert'}</p>
                          <h3 className="text-xl font-bold text-rose-900 mt-2">{alert.event}</h3>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-200 text-rose-900">Active</span>
                      </div>
                      <p className="text-sm text-rose-900 mt-3 whitespace-pre-line">{alert.description}</p>
                      <div className="mt-4 text-xs text-rose-700">
                        <span>Starts: {formatAlertTime(alert.start)}</span>
                        {alert.end && <span className="ml-4">Ends: {formatAlertTime(alert.end)}</span>}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-surface-container-low bg-surface-container-lowest p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">Resource Board</p>
              <h3 className="text-2xl font-bold text-on-surface mt-2">Share critical info</h3>
            </div>
            <form className="space-y-3" onSubmit={handleCreateUpdate}>
              <input
                className="w-full rounded-2xl border border-surface-container-low bg-white/70 p-3 text-sm"
                placeholder="Title (ex: Shelter open at Elm High)"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              />
              <textarea
                className="w-full rounded-2xl border border-surface-container-low bg-white/70 p-3 text-sm h-24"
                placeholder="Key details, hours, access, needs"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="rounded-2xl border border-surface-container-low bg-white/70 p-3 text-sm"
                  value={formData.category}
                  onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <input
                  className="rounded-2xl border border-surface-container-low bg-white/70 p-3 text-sm"
                  placeholder="Location"
                  value={formData.location_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, location_name: event.target.value }))}
                />
              </div>
              <input
                className="w-full rounded-2xl border border-surface-container-low bg-white/70 p-3 text-sm"
                placeholder="Contact info (optional)"
                value={formData.contact_info}
                onChange={(event) => setFormData((prev) => ({ ...prev, contact_info: event.target.value }))}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-primary text-on-primary py-3 font-bold disabled:opacity-60"
              >
                {isSubmitting ? 'Sharing...' : 'Share update'}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-surface-container-low bg-surface-container-lowest p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">Community Pulse</p>
              <h2 className="text-2xl font-bold text-on-surface mt-2">Latest recovery updates</h2>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-full p-1">
              {(['county', 'country', 'global'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setScope(option)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${scope === option ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {option === 'county' ? 'County' : option === 'country' ? 'Country' : 'Global'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {updatesLoading ? (
              <p className="text-sm text-on-surface-variant">Loading updates...</p>
            ) : updatesError ? (
              <p className="text-sm text-error">{updatesError}</p>
            ) : updates.length === 0 ? (
              <div className="rounded-2xl border border-surface-container-low p-6 text-sm text-on-surface-variant">
                No updates yet. Share the first recovery note for your community.
              </div>
            ) : (
              updates.map((update) => {
                const categoryMeta = CATEGORY_OPTIONS.find((option) => option.value === update.category) || CATEGORY_OPTIONS[0];
                const timestamp = update.timestamp || update.createdAt || update.created_at;
                return (
                  <article key={update.update_id} className="rounded-2xl border border-surface-container-low p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-on-surface-variant">{update.scope}{update.scope_value ? ` • ${update.scope_value}` : ''}</p>
                        <h3 className="text-xl font-bold text-on-surface mt-2">{update.title}</h3>
                        <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-line">{update.description}</p>
                        {(update.location_name || update.contact_info) && (
                          <div className="mt-3 text-sm text-on-surface-variant">
                            {update.location_name && <p>Location: {update.location_name}</p>}
                            {update.contact_info && <p>Contact: {update.contact_info}</p>}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryMeta.tone}`}>{categoryMeta.label}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                      <span>Shared by {update.user_name}</span>
                      {timestamp && <span>{new Date(timestamp).toLocaleString()}</span>}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};
