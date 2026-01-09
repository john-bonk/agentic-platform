/**
 * Workspace Navigation Tests
 * 
 * These tests ensure the dual navigation pattern for Global Residual Risk views
 * works correctly:
 * 
 * 1. IN-FRAME: /global-residual-risk keeps Home module active
 * 2. DIRECT: /cro/*, /cae/*, /ciso/* activate Residual Risk module
 * 
 * CRITICAL: These tests prevent regressions in workspace navigation behavior.
 */

import { describe, it, expect } from 'vitest';
import { getActiveModuleIndex, getModuleFromPath } from '../navigation';
import { WORKSPACE_DASHBOARDS, getDashboardByPersona, isDirectWorkspacePath, IN_FRAME_PATH } from '../workspaceDashboards';

describe('Module Detection', () => {
  describe('Home Module (index 0) should be active for', () => {
    it('root path /', () => {
      expect(getActiveModuleIndex('/')).toBe(0);
    });

    it('in-frame GRR path /global-residual-risk', () => {
      expect(getActiveModuleIndex('/global-residual-risk')).toBe(0);
    });

    it('other home paths like /inventory, /coverage-mapping', () => {
      expect(getActiveModuleIndex('/inventory')).toBe(0);
      expect(getActiveModuleIndex('/coverage-mapping')).toBe(0);
    });
  });

  describe('Residual Risk Module (index 4) should be active for', () => {
    it('CRO direct path /cro/global-residual-risk', () => {
      expect(getActiveModuleIndex('/cro/global-residual-risk')).toBe(4);
    });

    it('CAE direct path /cae/global-residual-risk', () => {
      expect(getActiveModuleIndex('/cae/global-residual-risk')).toBe(4);
    });

    it('CISO direct path /ciso/global-residual-risk', () => {
      expect(getActiveModuleIndex('/ciso/global-residual-risk')).toBe(4);
    });

    it('any /cro/* subpath', () => {
      expect(getActiveModuleIndex('/cro/risk-heatmap')).toBe(4);
    });

    it('any /cae/* subpath', () => {
      expect(getActiveModuleIndex('/cae/mitigation-tracker')).toBe(4);
    });
  });

  describe('Other modules should be active for their paths', () => {
    it('Workflows (index 1) for /workflow/*', () => {
      expect(getActiveModuleIndex('/workflows')).toBe(1);
      expect(getActiveModuleIndex('/workflow/123')).toBe(1);
    });

    it('Intelligence Hub (index 2) for /intelligence/*', () => {
      expect(getActiveModuleIndex('/intelligence')).toBe(2);
    });

    it('Reporting (index 3) for /reporting/*', () => {
      expect(getActiveModuleIndex('/reporting')).toBe(3);
    });
  });
});

describe('getModuleFromPath', () => {
  it('returns Home module for /global-residual-risk', () => {
    const module = getModuleFromPath('/global-residual-risk');
    expect(module.id).toBe('home');
  });

  it('returns Residual Risk module for /cro/global-residual-risk', () => {
    const module = getModuleFromPath('/cro/global-residual-risk');
    expect(module.id).toBe('residual-risk');
  });

  it('returns Residual Risk module for /cae/global-residual-risk', () => {
    const module = getModuleFromPath('/cae/global-residual-risk');
    expect(module.id).toBe('residual-risk');
  });

  it('returns Residual Risk module for /ciso/global-residual-risk', () => {
    const module = getModuleFromPath('/ciso/global-residual-risk');
    expect(module.id).toBe('residual-risk');
  });
});

describe('Workspace Dashboard Registry', () => {
  it('has all three workspaces configured', () => {
    expect(WORKSPACE_DASHBOARDS.length).toBe(3);
    expect(WORKSPACE_DASHBOARDS.map(d => d.persona)).toEqual(['CRO', 'CAE', 'CISO']);
  });

  it('all dashboards have same inFramePath', () => {
    for (const dashboard of WORKSPACE_DASHBOARDS) {
      expect(dashboard.inFramePath).toBe('/global-residual-risk');
    }
  });

  it('each dashboard has unique directPath', () => {
    const paths = WORKSPACE_DASHBOARDS.map(d => d.directPath);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(WORKSPACE_DASHBOARDS.length);
  });

  it('getDashboardByPersona returns correct dashboard', () => {
    expect(getDashboardByPersona('CRO')?.id).toBe('cro-dashboard');
    expect(getDashboardByPersona('CAE')?.id).toBe('cae-dashboard');
    expect(getDashboardByPersona('CISO')?.id).toBe('ciso-dashboard');
  });

  it('IN_FRAME_PATH constant is correct', () => {
    expect(IN_FRAME_PATH).toBe('/global-residual-risk');
  });
});

describe('isDirectWorkspacePath', () => {
  it('returns true for direct workspace paths', () => {
    expect(isDirectWorkspacePath('/cro/global-residual-risk')).toBe(true);
    expect(isDirectWorkspacePath('/cae/global-residual-risk')).toBe(true);
    expect(isDirectWorkspacePath('/ciso/global-residual-risk')).toBe(true);
  });

  it('returns false for in-frame path', () => {
    expect(isDirectWorkspacePath('/global-residual-risk')).toBe(false);
  });

  it('returns false for other paths', () => {
    expect(isDirectWorkspacePath('/')).toBe(false);
    expect(isDirectWorkspacePath('/inventory')).toBe(false);
    expect(isDirectWorkspacePath('/reporting')).toBe(false);
  });
});

/**
 * PATTERN VALIDATION
 * 
 * These tests ensure the architecture remains consistent.
 * If these fail, someone has likely broken the dual-navigation pattern.
 */
describe('Pattern Validation', () => {
  it('in-frame path is in Home module scope', () => {
    const moduleIndex = getActiveModuleIndex(IN_FRAME_PATH);
    expect(moduleIndex).toBe(0); // Home = 0
  });

  it('all direct paths are in Residual Risk module scope', () => {
    for (const dashboard of WORKSPACE_DASHBOARDS) {
      const moduleIndex = getActiveModuleIndex(dashboard.directPath);
      expect(moduleIndex).toBe(4); // Residual Risk = 4
    }
  });

  it('direct paths all follow /{persona}/global-residual-risk pattern', () => {
    for (const dashboard of WORKSPACE_DASHBOARDS) {
      const expectedPath = `/${dashboard.persona.toLowerCase()}/global-residual-risk`;
      expect(dashboard.directPath).toBe(expectedPath);
    }
  });
});
