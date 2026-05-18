/**
 * Decap CMS custom widget: multi-image
 * Requires React 18 loaded from CDN in admin/index.html (window.React).
 * Uploads to /api/upload via serve.py, returns array of paths to CMS.
 */
(function () {
  'use strict';

  var React = window.React;
  var h = React.createElement;

  var S = {
    zone: function (over) {
      return {
        border: '2px dashed ' + (over ? '#f97316' : '#d1d5db'),
        borderRadius: '8px',
        padding: '28px 16px',
        textAlign: 'center',
        background: over ? '#fff7ed' : '#fafafa',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color .15s, background .15s',
        marginBottom: '10px',
        userSelect: 'none',
      };
    },
    fileInput: {
      position: 'absolute', inset: 0, opacity: 0,
      cursor: 'pointer', width: '100%', height: '100%',
    },
    label:  { fontWeight: 600, fontSize: '.875rem', color: '#374151' },
    hint:   { fontSize: '.75rem', color: '#9ca3af', marginTop: '4px' },
    err:    { color: '#b91c1c', fontSize: '.8rem', margin: '4px 0 8px' },
    count:  { fontSize: '.8rem', fontWeight: 600, color: '#374151', margin: '0 0 6px' },
    list:   {
      maxHeight: '200px', overflowY: 'auto',
      border: '1px solid #e5e7eb', borderRadius: '6px',
      padding: '6px 8px',
    },
    row:    { display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '.8rem' },
    num:    { color: '#9ca3af', minWidth: '22px', textAlign: 'right', flexShrink: 0 },
    name:   { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' },
    delBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0 },
  };

  class MultiImageControl extends React.Component {
    constructor(props) {
      super(props);
      this.state = { uploading: false, error: null, over: false };
      this.handleDrop   = this.handleDrop.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    getPages() {
      var v = this.props.value;
      if (!v) return [];
      if (typeof v.toJS === 'function') return v.toJS();
      if (Array.isArray(v)) return v;
      return [];
    }

    async uploadFiles(files) {
      var arr = Array.from(files);
      if (!arr.length) return;
      this.setState({ uploading: true, error: null });
      var fd = new FormData();
      fd.append('mode', 'files-only');
      arr.forEach(function (f) { fd.append('files', f); });
      try {
        var r = await fetch('/api/upload', { method: 'POST', body: fd });
        var d = await r.json();
        if (d.ok) {
          this.props.onChange(d.files);
        } else {
          this.setState({ error: d.error || 'Chyba uploadu' });
        }
      } catch (_) {
        this.setState({ error: 'Nelze se připojit — běží serve.py na portu 8181?' });
      }
      this.setState({ uploading: false });
    }

    handleDrop(e) {
      e.preventDefault();
      this.setState({ over: false });
      this.uploadFiles(e.dataTransfer.files);
    }

    handleChange(e) {
      this.uploadFiles(e.target.files);
    }

    removeItem(idx) {
      var p = this.getPages().slice();
      p.splice(idx, 1);
      this.props.onChange(p);
    }

    render() {
      var self    = this;
      var over    = this.state.over;
      var loading = this.state.uploading;
      var error   = this.state.error;
      var pages   = this.getPages();

      return h('div', null,

        h('div', {
          style: S.zone(over),
          onDragOver:  function (e) { e.preventDefault(); self.setState({ over: true }); },
          onDragLeave: function ()  { self.setState({ over: false }); },
          onDrop:      this.handleDrop,
        },
          h('input', { type: 'file', multiple: true, accept: 'image/*', style: S.fileInput, onChange: this.handleChange }),
          loading
            ? h('span', { style: S.label }, '⏳ Nahrávám...')
            : h('div', null,
                h('div', { style: S.label }, '📂 Přetáhni nebo klikni pro výběr'),
                h('div', { style: S.hint  }, 'Vyber všechny stránky najednou — JPG, PNG')
              )
        ),

        error ? h('p', { style: S.err }, '⚠ ', error) : null,

        pages.length > 0
          ? h('div', null,
              h('p', { style: S.count }, pages.length + ' stránek'),
              h('div', { style: S.list },
                pages.map(function (p, i) {
                  return h('div', { key: p + i, style: S.row },
                    h('span', { style: S.num  }, i + 1 + '.'),
                    h('span', { style: S.name }, p.split('/').pop()),
                    h('button', {
                      type: 'button', title: 'Odebrat', style: S.delBtn,
                      onClick: function () { self.removeItem(i); },
                    }, '×')
                  );
                })
              )
            )
          : null
      );
    }
  }

  CMS.registerWidget('multi-image', MultiImageControl);

})();
