import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "react";
import { TalentCheckPage } from "./TalentCheckPage";

vi.mock("../auth/talentMatchSupabaseClient", () => ({
  ensureTalentMatchSession: vi.fn().mockResolvedValue(undefined),
  getTalentMatchSupabaseClient: vi.fn().mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-talent-match-token",
          },
        },
      }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  }),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("TalentCheckPage", () => {
  it("renders target company options and header correctly", () => {
    render(<TalentCheckPage />);

    expect(screen.getByText("Company Talent Check")).toBeInTheDocument();
    expect(screen.getAllByText("Google LLC").length).toBeGreaterThan(0);
    expect(screen.getByText("Microsoft Corporation")).toBeInTheDocument();
    expect(screen.getByText("Oracle Financial Services Software")).toBeInTheDocument();
    expect(screen.getByText("Run Talent Check")).toBeInTheDocument();
  });

  it("loads synthetic preview data and displays all 12 categories and score 88", async () => {
    render(<TalentCheckPage />);

    const previewButton = screen.getByText("Load Preview Data");
    fireEvent.click(previewButton);

    await waitFor(() => {
      // Score 88 from canonical fixture
      expect(screen.getAllByText("88").length).toBeGreaterThan(0);
    });

    // Check header and summary
    expect(screen.getByText(/Target Company Readiness: Google LLC/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample data, not your results\./i)).toBeInTheDocument();
    expect(screen.getAllByText("tc-v1").length).toBeGreaterThan(0);

    // Verify all 12 RADIX categories appear in the table
    const categories = [
      "COD",
      "DSA",
      "OOD",
      "APTI",
      "COMM",
      "AI",
      "CLOUD",
      "SQL",
      "SWE",
      "SYSD",
      "NETW",
      "OS",
    ];
    for (const cat of categories) {
      expect(screen.getAllByText(cat).length).toBeGreaterThan(0);
    }

    // Verify surplus and gap badges (APTI, COMM, DSA have +1; COD, SQL have -2)
    expect(screen.getAllByText(/Surplus \(\+1\)/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/Gap \(-2\)/).length).toBeGreaterThanOrEqual(2);
  });

  it("displays error notice when API call returns failure", async () => {
    // Mock fetch failure
    vi.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({
            error: {
              code: "INCOMPLETE_CANDIDATE_PROFILE",
              message: "Your candidate profile is incomplete.",
              details: [{ missing_category_codes: ["COD", "SQL"] }],
            },
          }),
      } as Response),
    );

    render(<TalentCheckPage />);

    const runButton = screen.getByText("Run Talent Check");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("Assessment Evaluation Blocked")).toBeInTheDocument();
      expect(screen.getByText("Your candidate profile is incomplete.")).toBeInTheDocument();
      expect(screen.getByTestId("category-completion-checklist")).toBeInTheDocument();
      expect(screen.getByText("Complete COD first →")).toBeInTheDocument();
    });
  });

  it("shows learning topics only for genuine gaps and explains when validated topics are unavailable", async () => {
    render(<TalentCheckPage />);

    const previewButton = screen.getByText("Load Preview Data");
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getAllByText("88").length).toBeGreaterThan(0);
    });

    // Click the first genuine gap's learning topics control.
    const focusButtons = screen.getAllByRole("button", { name: /Learning topics/i });
    expect(focusButtons.length).toBeGreaterThan(0);
    fireEvent.click(focusButtons[0]);

    expect(
      screen.getByText(/No validated learning topics are available for this gap yet/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/No learning gap/i).length).toBeGreaterThan(0);
  });

  it("renders 12-axis radar chart with interactive view toggles when results are displayed", async () => {
    render(<TalentCheckPage />);

    // Before running, radar is not present
    expect(screen.queryByTestId("radar-comparison-chart")).not.toBeInTheDocument();

    const previewButton = screen.getByText("Load Preview Data");
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByTestId("radar-comparison-chart")).toBeInTheDocument();
    });

    // Check radar title and company name
    expect(screen.getByText(/12-Axis Competency Radar Comparison/i)).toBeInTheDocument();

    // Check view toggles
    const candidateToggle = screen.getByRole("button", { name: "Candidate" });
    const requiredToggle = screen.getByRole("button", { name: "Required" });
    const bothToggle = screen.getByRole("button", { name: "Both" });

    expect(candidateToggle).toBeInTheDocument();
    expect(requiredToggle).toBeInTheDocument();
    expect(bothToggle).toBeInTheDocument();

    // Click Candidate toggle
    fireEvent.click(candidateToggle);
    // Click Required toggle
    fireEvent.click(requiredToggle);
    // Click Both toggle
    fireEvent.click(bothToggle);
  });

  it("renders best-fit company ranking sorted from highest to lowest readiness score with interactive inspection", async () => {
    render(<TalentCheckPage />);

    const previewButton = screen.getByText("Load Preview Data");
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByTestId("company-ranking-card")).toBeInTheDocument();
    });

    // Check header
    expect(screen.getByText(/Best-Fit Company Ranking \(tc-v1\)/i)).toBeInTheDocument();
    expect(screen.getByText("#1 Best Fit")).toBeInTheDocument();

    // Verify all 3 company ranking cards are present
    expect(screen.getByTestId("rank-card-google")).toBeInTheDocument();
    expect(screen.getByTestId("rank-card-microsoft")).toBeInTheDocument();
    expect(screen.getByTestId("rank-card-oracle_fss")).toBeInTheDocument();

    // Test clicking View Breakdown on Microsoft
    const msCard = screen.getByTestId("rank-card-microsoft");
    const viewButton = msCard.querySelector("button");
    expect(viewButton).toBeInTheDocument();
    if (viewButton) {
      fireEvent.click(viewButton);
    }

    // Verify active view switched
    await waitFor(() => {
      expect(
        screen.getByText(/Target Company Readiness: Microsoft Corporation/i),
      ).toBeInTheDocument();
    });
  });

  it("renders what-if simulator with live sliders, simulation badge and non-destructive disclaimer", async () => {
    render(<TalentCheckPage />);

    const previewButton = screen.getByText("Load Preview Data");
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByTestId("what-if-simulator")).toBeInTheDocument();
    });

    // Verify prominent simulation labeling
    expect(screen.getByText(/What-If Readiness Simulator \(Client-Side\)/i)).toBeInTheDocument();
    expect(screen.getByText("SIMULATION ONLY")).toBeInTheDocument();
    expect(screen.getByText(/Simulation Notice:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/All recalculations are executed purely client-side/i),
    ).toBeInTheDocument();

    // Verify baseline score is shown
    expect(screen.getByText("Baseline Score")).toBeInTheDocument();
    expect(screen.getByText("Simulated Score")).toBeInTheDocument();
    expect(screen.getByText(/Baseline match \(No delta\)/i)).toBeInTheDocument();

    // Verify category sliders exist
    expect(screen.getByTestId("slider-box-COD")).toBeInTheDocument();
    expect(screen.getByTestId("slider-box-DSA")).toBeInTheDocument();
    expect(screen.getByTestId("slider-box-SQL")).toBeInTheDocument();
  });
});
