

export function Support() {
  return (
    <main className="flex-1 overflow-y-auto p-md lg:p-gutter bg-background">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-surface border border-outline-variant/30 rounded-xl p-xl text-center">
          <span className="material-symbols-outlined text-[64px] text-primary mb-md">
            support_agent
          </span>
          <h1 className="font-headline-md text-3xl text-on-surface mb-sm">
            Support Center
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto mb-lg">
            Our institutional support team is available 24/5. Please check the documentation or submit a ticket below.
          </p>
          <div className="flex justify-center gap-md">
            <button 
              onClick={() => window.open('mailto:support@optionpluse.com', '_blank')}
              className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
            >
              Submit Ticket
            </button>
            <button 
              onClick={() => window.open('https://optionpluse.com/docs', '_blank')}
              className="border border-outline bg-surface text-on-surface font-label-md px-6 py-2 rounded-full hover:bg-surface-container-low transition-colors"
            >
              Read Docs
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
