#!/usr/bin/env python3
"""Builds one standalone HTML file per screen in prd-views/, so each can be opened or attached to the PRD on its own.
Each file is the full prototype (or onboarding) opened on one state.
Run:  python3 build_prd_views.py   (from the prototype folder)"""
import pathlib, html
here = pathlib.Path(__file__).resolve().parent
db = (here / 'tringg-ordering.html').read_text(encoding='utf-8')
ob = (here / 'onboarding.html').read_text(encoding='utf-8')
out = here / 'prd-views'
out.mkdir(exist_ok=True)

def dash(init):
    pre = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    boot = "applyRole(true);loadScenario(%s);applyRole();"
    return pre + db + '<script>(function(){' + init + '})();</script></html>'

def scen(name, sub=None):
    s = "applyRole(true);loadScenario('%s');applyRole();" % name
    if sub is not None:
        s += "DB.subscribed=%s;" % ('true' if sub else 'false')
    return s

def goto(route='settings', outlet='all', st='ord', extra=''):
    return "S.route='%s';S.outlet='%s';S.set='%s';%srender();" % (route, outlet, st, extra)

def anchor(sec):
    return "setTimeout(function(){var e=$('ordsec-%s');if(e)e.scrollIntoView({block:'start'});},150);" % sec

VIEWS = [
 ('01-onboarding-step3-choose-services', 'Onboarding step 3: choose Reservations, Ordering or both (both selected by default)', 'ob', "pick('rossa');S.rs=99;go(3);"),
 ('02-onboarding-step3-ordering-only', 'Onboarding step 3 with only Ordering selected: ordering settings shown, reservation rules hidden', 'ob', "pick('rossa');S.rs=99;S.mods.res=false;go(3);"),
 ('03-onboarding-step3-reservations-only', 'Onboarding step 3 with only Reservations selected: reservation rules shown, ordering hidden', 'ob', "pick('rossa');S.rs=99;S.mods.ord=false;go(3);"),
 ('04-onboarding-go-live', 'Onboarding last screen: what is next (finish ordering, turn on ordering, forward the line)', 'ob', "pick('rossa');S.rs=99;go(6);"),
 ('05-overview-setup-checklist', 'Overview with the Ordering setup checklist (single outlet)', 'db', scen('off') + "S.outlet='wl';DB.svc.wl={set:'draft',pick:true,prep:25,del:true,rad:{mi:4,fee:4,min:20}};DB.deliveryMode.wl='radius';S.route='overview';render();"),
 ('06-ordering-all-outlets', 'Settings > Ordering in All outlets: outlet status table and brand-wide settings', 'db', scen('live') + goto('settings','all')),
 ('07-ordering-pickup-and-delivery', 'Settings > Ordering for one outlet: Pickup & delivery', 'db', scen('live') + goto('settings','wp') + anchor('svc')),
 ('08-outlet-hours-with-ordering-hours', 'Settings > Outlet hours: opening hours, special dates and Ordering hours', 'db', scen('live') + goto('settings','wp','hours') + "setTimeout(function(){var e=$('ohrs');if(e)e.scrollIntoView({block:'start'});},150);"),
 ('09-outlet-hours-advanced-ordering', 'Outlet hours: Ordering hours advanced (day-by-day, special dates and closures)', 'db', scen('live') + goto('settings','wp','hours','S.ohAdv=true;') + "DB.ohx.wp={days:[0,1,2,3,4,5,6].map(function(i){return {on:i!==0,a:'',b:''}}),sp:[{d:'Nov 27',closed:true,a:'',b:''},{d:'Dec 24',closed:false,a:'11:00 AM',b:'6:00 PM'}]};render();setTimeout(function(){var e=$('ohrs');if(e)e.scrollIntoView({block:'start'});},150);"),
 ('10-delivery-area-editor', 'Delivery area editor: large map, draw zones, zone details', 'db', scen('live') + goto('settings','wp') + "S.zoneOutlet='wp';S.zoneSel='A';openZed();"),
 ('11-accepting-orders-and-pre-orders', 'Accepting orders (auto-accept with exceptions), pre-orders and large orders', 'db', scen('live') + goto('settings','wp') + anchor('acc')),
 ('12-payments', 'Payments: Stripe account, pickup payment, cash on delivery rules, expired-link fallbacks', 'db', scen('live') + goto('settings','wp') + anchor('pay')),
 ('13-payment-link-preview', 'Payments with the payment link preview open (texts and payment page)', 'db', scen('live') + goto('settings','wp','ord','S.plOpen=true;') + "setTimeout(function(){var c=[].slice.call(document.querySelectorAll('.scard')).find(function(x){return x.innerText.indexOf('What the caller sees')>=0});if(c)c.scrollIntoView({block:'start'});},150);"),
 ('14-taxes', 'Taxes inside Settings > Ordering', 'db', scen('live') + goto('settings','wp') + anchor('tax')),
 ('15-not-subscribed-orders', 'Not subscribed: Orders asks to subscribe', 'db', scen('ready', False) + goto('orders','wp')),
 ('16-not-subscribed-agents', 'Not subscribed: Agents and Calls show the Subscribe prompt', 'db', scen('ready', False) + goto('agents','wp')),
 ('17-turn-on-ordering-asks-to-subscribe', 'Last checklist step opens the Subscribe confirmation', 'db', scen('ready', False) + "DB.caps.ord=false;DB.orderingOn=false;" + goto('overview','wp') + "openSub();"),
 ('18-orders-list-and-filter', 'Orders: tabs, search and the Filter panel (same structure as Calls)', 'db', scen('live') + "S.route='orders';S.outlet='all';S.orders.fo=true;S.orders.ful='delivery';render();"),
 ('19-settings-services', 'Settings > Services: choose what the agent handles (Reservations, Ordering)', 'db', scen('live') + goto('settings','all','mods')),
 ('20-ordering-only-reservations-greyed', 'Ordering only: Overview with reservation items greyed out', 'db', scen('live') + "MODS.res=false;applyMods();S.route='overview';S.outlet='wp';render();"),
 ('21-reservations-only-ordering-greyed', 'Reservations only: Orders screen greyed out with a Turn on button', 'db', scen('live') + "MODS.ord=false;applyMods();S.route='orders';S.outlet='wp';render();"),
 ('22-profile', 'My profile: details, security, notifications and access (opens from the top right or the left menu)', 'db', scen('live') + "S.route='profile';S.outlet='all';render();"),
]
rows = []
for name, title, kind, init in VIEWS:
    if kind == 'ob':
        page = ob.replace('</script>\n</body>', init + 'render();\n</script>\n</body>') if '</script>\n</body>' in ob else None
        if page is None:
            raise SystemExit('onboarding.html end marker not found')
        # run the init after the app has started: it ends with render(); so append before the closing script
        page = ob.replace('render();\n</script>', 'render();\n' + init + 'render();\n</script>', 1)
    else:
        page = dash(init)
    (out / (name + '.html')).write_text(page, encoding='utf-8')
    rows.append('<li><a href="%s.html">%s</a><br><small>%s</small></li>' % (name, name, html.escape(title)))
index = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Tringg PRD screens</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}li{margin:14px 0}small{color:#666}</style></head><body><h1>Tringg ordering: screens for the PRD</h1><p>Each file is the working prototype opened on one screen. Open it in a browser and screenshot or attach it.</p><ol>' + ''.join(rows) + '</ol></body></html>'
(out / 'index.html').write_text(index, encoding='utf-8')
print('wrote', len(VIEWS), 'views')
