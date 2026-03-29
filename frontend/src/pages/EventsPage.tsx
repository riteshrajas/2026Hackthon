import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { createEvent, getEvents, getEventSignups, signupEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [signupsByEventId, setSignupsByEventId] = useState<Record<string, any[]>>({});
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [scope, setScope] = useState<'county' | 'country' | 'global'>('county');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location_name: '',
    location_address: '',
    capacity: '',
    organization_name: '',
    organization_url: '',
    details_url: ''
  });

  const scopeValue = useMemo(() => {
    if (scope === 'country') return user?.country || 'United States';
    if (scope === 'global') return '';
    return user?.neighborhood_tag || '';
  }, [scope, user?.country, user?.neighborhood_tag]);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getEvents(scope, scopeValue)
      .then((data) => setEvents(data))
      .catch((error) => {
        console.error(error);
        toast.error('Failed to load events');
      })
      .finally(() => setIsLoading(false));
  }, [scope, scopeValue, user]);

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.description || !formData.start_time) {
      toast.error('Add title, description, and start time');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createEvent({
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time || undefined,
        location_name: formData.location_name,
        location_address: formData.location_address,
        scope,
        scope_value: scopeValue,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        organization_name: formData.organization_name,
        organization_url: formData.organization_url,
        details_url: formData.details_url
      });
      setEvents((prev) => [created, ...prev]);
      toast.success('Event created');
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location_name: '',
        location_address: '',
        capacity: '',
        organization_name: '',
        organization_url: '',
        details_url: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (eventId: string) => {
    try {
      await signupEvent(eventId);
      setEvents((prev) => prev.map((item) => (
        item.event_id === eventId
          ? { ...item, is_signed_up: true, signup_count: item.signup_count + 1 }
          : item
      )));
      toast.success('Signed up for event');
    } catch (error) {
      console.error(error);
      toast.error('Signup failed');
    }
  };

  const handleToggleAttendees = async (eventId: string) => {
    if (openEventId === eventId) {
      setOpenEventId(null);
      return;
    }

    setOpenEventId(eventId);
    if (signupsByEventId[eventId]) {
      return;
    }

    try {
      const attendees = await getEventSignups(eventId);
      setSignupsByEventId((prev) => ({ ...prev, [eventId]: attendees }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load attendees');
    }
  };

  const makeMapLinks = (location: string) => {
    const query = encodeURIComponent(location);
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
      apple: `https://maps.apple.com/?q=${query}`
    };
  };

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Community Events</p>
              <h1 className="text-4xl font-black text-on-surface">Upcoming Eco Events</h1>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest rounded-full p-1 shadow-sm">
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

          {isLoading ? (
            <div className="text-on-surface-variant">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-on-surface-variant">
              No events yet. Create one for your community!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {events.map((event) => {
                const location = event.location_address || event.location_name;
                const links = location ? makeMapLinks(location) : null;
                const isCreator = event.creator_id === user?.id;
                const attendees = signupsByEventId[event.event_id] || [];
                return (
                  <article key={event.event_id} className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-low">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                          <span>{event.scope}</span>
                          {event.scope_value && <span>• {event.scope_value}</span>}
                        </div>
                        <h2 className="text-2xl font-bold text-on-surface mt-2">{event.title}</h2>
                        <p className="text-sm text-on-surface-variant mt-2">{event.description}</p>
                        <p className="text-sm text-on-surface-variant mt-3">
                          {new Date(event.start_time).toLocaleString()}
                          {event.end_time && ` - ${new Date(event.end_time).toLocaleString()}`}
                        </p>
                        {location && (
                          <p className="text-sm text-on-surface-variant mt-1">
                            {location}
                            {links && (
                              <span className="ml-2">
                                <a className="text-primary font-semibold" href={links.google} target="_blank" rel="noreferrer">Google Maps</a>
                                <span className="mx-2 text-on-surface-variant">|</span>
                                <a className="text-primary font-semibold" href={links.apple} target="_blank" rel="noreferrer">Apple Maps</a>
                              </span>
                            )}
                          </p>
                        )}
                        {event.organization_name && (
                          <p className="text-xs text-on-surface-variant mt-2">
                            Hosted by {event.organization_name}
                          </p>
                        )}
                        {event.details_url && (
                          <a className="text-xs text-primary font-semibold mt-2 inline-block" href={event.details_url} target="_blank" rel="noreferrer">
                            Event details
                          </a>
                        )}
                        {isCreator && (
                          <button
                            type="button"
                            onClick={() => handleToggleAttendees(event.event_id)}
                            className="mt-3 text-xs font-semibold text-primary"
                          >
                            {openEventId === event.event_id ? 'Hide attendees' : `View attendees (${event.signup_count})`}
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">Spots</p>
                        <p className="font-bold text-on-surface">
                          {event.signup_count}{event.capacity ? ` / ${event.capacity}` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSignup(event.event_id)}
                          disabled={event.is_signed_up || event.is_full}
                          className="mt-3 px-4 py-2 rounded-full text-xs font-bold bg-primary text-on-primary disabled:opacity-50"
                        >
                          {event.is_full ? 'Full' : event.is_signed_up ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    </div>
                    {isCreator && openEventId === event.event_id && (
                      <div className="mt-4 border-t border-surface-container-low pt-4">
                        {attendees.length === 0 ? (
                          <p className="text-xs text-on-surface-variant">No one has signed up yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {attendees.map((attendee) => (
                              <div key={attendee.user_id} className="flex items-center gap-3">
                                <img
                                  alt={`${attendee.name} avatar`}
                                  className="w-9 h-9 rounded-full object-cover"
                                  src={attendee.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=6effc1&color=006948`}
                                />
                                <div>
                                  <p className="text-sm font-semibold text-on-surface">{attendee.name}</p>
                                  {attendee.email && (
                                    <a className="text-xs text-primary" href={`mailto:${attendee.email}`}>
                                      {attendee.email}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-low h-fit">
          <h2 className="text-2xl font-bold text-on-surface mb-4">Create an Event</h2>
          <form className="space-y-4" onSubmit={handleCreateEvent}>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Title</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Description</label>
              <textarea
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2 min-h-[110px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-on-surface-variant">Start</label>
                <input
                  type="datetime-local"
                  className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant">End</label>
                <input
                  type="datetime-local"
                  className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Location name</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Location address</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Capacity (optional)</label>
              <input
                type="number"
                min="1"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Organization name</label>
              <input
                type="text"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Organization URL</label>
              <input
                type="url"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.organization_url}
                onChange={(e) => setFormData({ ...formData, organization_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant">Details link</label>
              <input
                type="url"
                className="w-full mt-1 rounded-lg bg-surface-container-low px-4 py-2"
                value={formData.details_url}
                onChange={(e) => setFormData({ ...formData, details_url: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </aside>
      </div>
    </MainLayout>
  );
};
