# -*- coding: utf-8 -*-
"""自測 1：正常 PASS（sync API，順便驗 gpu_wrap 的 sync 包裝）"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from st_common import HTML, OUT, check, finish
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 640, 'height': 400})
    pg = ctx.new_page()
    pg.set_content(HTML)
    pg.fill('#name', '祐廷'); pg.click('#go')
    check('按下按鈕以後文字變了', pg.inner_text('#msg') == '按過了：祐廷', pg.inner_text('#msg'))
    pg.screenshot(path=os.path.join(OUT, 'pass.png'))
    b.close()
finish()
