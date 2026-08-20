package com.shixingxu.qingyun.service;

import com.shixingxu.qingyun.entity.Banner;

import java.util.List;

public interface BannerService {

    /** 获取首页 Banner */
    List<Banner> listVisible();
}
