package com.shixingxu.qingyun.service;

import com.shixingxu.qingyun.entity.Feature;

import java.util.List;

public interface FeatureService {

    /** 获取所有上线玩法特色，按 sort 升序 */
    List<Feature> listOnline();
}
